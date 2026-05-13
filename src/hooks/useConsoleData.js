import { useCallback, useEffect, useMemo, useState } from 'react';
import { client as mockClient, guests as mockGuests, sponsorPerks as mockSponsorPerks } from '../data/mockData.js';
import { hasSupabaseConfig, supabase } from '../lib/supabaseClient.js';
import { useAuth } from '../context/AuthContext.jsx';

function titleCaseStatus(value) {
  if (!value) return 'Unpaid';
  return value
    .replaceAll('_', ' ')
    .replace(/\b\w/g, (letter) => letter.toUpperCase())
    .replace('Deposit Paid', 'Deposit')
    .replace('Not Issued', 'Not Issued');
}

function mapPassStatus(value, paymentStatus) {
  if (paymentStatus === 'deposit_paid' && value === 'reserved') return 'Pending Balance';
  return titleCaseStatus(value || 'not_issued');
}

function getOrdersTotal(orders) {
  return orders
    .filter((order) => ['paid', 'complete', 'completed', 'succeeded'].includes(String(order.status).toLowerCase()))
    .reduce((sum, order) => sum + Number(order.amount_gbp || 0), 0);
}

function buildGuestRows({ guestRows, passRows, orderRows, checkinRows }) {
  return guestRows.map((guest) => {
    const guestPass = passRows.find((pass) => pass.guest_id === guest.id);
    const guestOrders = orderRows.filter((order) => order.guest_id === guest.id);
    const checkedIn = checkinRows.some((checkin) => checkin.guest_id === guest.id);

    return {
      id: guest.id,
      name: guest.full_name,
      email: guest.email,
      phone: guest.phone || '—',
      tier: guest.tier,
      paymentStatus: titleCaseStatus(guest.payment_status),
      accessStatus: mapPassStatus(guestPass?.status, guest.payment_status),
      checkedIn,
      sponsor: guest.sponsor_source || '—',
      spend: getOrdersTotal(guestOrders),
      notes: guest.notes || '—',
      passCode: guestPass?.pass_code || '',
    };
  });
}

function buildSponsorRows({ sponsorRows, perkRows, redemptionRows }) {
  return perkRows.map((perk) => {
    const sponsor = sponsorRows.find((item) => item.id === perk.sponsor_id);
    const redeemed = redemptionRows.filter((redemption) => redemption.sponsor_perk_id === perk.id).length;
    return {
      id: perk.id,
      sponsor: sponsor?.name || 'Sponsor',
      perk: perk.name,
      issued: perk.issue_limit || sponsor?.allocation_limit || 0,
      redeemed,
      value: perk.description || 'Sponsor allocation and redemption proof.',
    };
  });
}

export function useConsoleData() {
  const { user, authLoading } = useAuth();
  const [state, setState] = useState({
    client: mockClient,
    guests: mockGuests,
    sponsorPerks: mockSponsorPerks,
    event: null,
    loading: hasSupabaseConfig,
    error: '',
    mode: hasSupabaseConfig ? 'live' : 'demo',
  });

  const loadData = useCallback(async () => {
    if (!hasSupabaseConfig || !supabase) {
      setState({
        client: mockClient,
        guests: mockGuests,
        sponsorPerks: mockSponsorPerks,
        event: null,
        loading: false,
        error: '',
        mode: 'demo',
      });
      return;
    }

    if (!user) {
      setState((previous) => ({ ...previous, loading: false, error: '', mode: 'live' }));
      return;
    }

    setState((previous) => ({ ...previous, loading: true, error: '', mode: 'live' }));

    try {
      const { data: events, error: eventsError } = await supabase
        .from('events')
        .select('id, client_id, name, location, starts_at, ends_at, capacity, status, clients(name, slug)')
        .order('starts_at', { ascending: true })
        .limit(1);

      if (eventsError) throw eventsError;

      const event = events?.[0] || null;
      if (!event) {
        setState({
          client: {
            name: 'Uriyel',
            eventName: 'No event found',
            dateLabel: 'Run seed data or create an event',
            status: 'Live mode',
          },
          guests: [],
          sponsorPerks: [],
          event: null,
          loading: false,
          error: '',
          mode: 'live',
        });
        return;
      }

      const [guestResult, passResult, orderResult, checkinResult, sponsorResult, perkResult, redemptionResult] = await Promise.all([
        supabase.from('guest_profiles').select('*').eq('event_id', event.id).order('created_at', { ascending: true }),
        supabase.from('passes').select('*').eq('event_id', event.id),
        supabase.from('orders').select('*').eq('event_id', event.id),
        supabase.from('checkins').select('*').eq('event_id', event.id),
        supabase.from('sponsor_partners').select('*').eq('event_id', event.id),
        supabase.from('sponsor_perks').select('*').eq('event_id', event.id),
        supabase.from('perk_redemptions').select('*').eq('event_id', event.id),
      ]);

      const firstError = [guestResult, passResult, orderResult, checkinResult, sponsorResult, perkResult, redemptionResult].find((result) => result.error)?.error;
      if (firstError) throw firstError;

      const nextGuests = buildGuestRows({
        guestRows: guestResult.data || [],
        passRows: passResult.data || [],
        orderRows: orderResult.data || [],
        checkinRows: checkinResult.data || [],
      });

      const nextSponsorPerks = buildSponsorRows({
        sponsorRows: sponsorResult.data || [],
        perkRows: perkResult.data || [],
        redemptionRows: redemptionResult.data || [],
      });

      setState({
        client: {
          name: event.clients?.name || 'Uriyel Client',
          eventName: event.name,
          dateLabel: event.starts_at
            ? new Intl.DateTimeFormat('en-GB', { month: 'long', year: 'numeric' }).format(new Date(event.starts_at))
            : event.location || 'Date not set',
          status: event.status || 'Live mode',
        },
        guests: nextGuests,
        sponsorPerks: nextSponsorPerks,
        event,
        loading: false,
        error: '',
        mode: 'live',
      });
    } catch (error) {
      setState((previous) => ({
        ...previous,
        loading: false,
        error: error.message || 'Could not load Supabase data.',
        mode: 'live',
      }));
    }
  }, [user]);

  useEffect(() => {
    if (authLoading) return;
    loadData();
  }, [authLoading, loadData]);

  const metrics = useMemo(() => {
    const revenue = state.guests.reduce((sum, guest) => sum + Number(guest.spend || 0), 0);
    const checkedIn = state.guests.filter((guest) => guest.checkedIn).length;
    const issued = state.guests.filter((guest) => ['Issued', 'Activated', 'Checked In'].includes(guest.accessStatus)).length;
    const outstanding = state.guests
      .filter((guest) => guest.paymentStatus === 'Deposit' || guest.paymentStatus === 'Unpaid')
      .reduce((sum, guest) => sum + (guest.paymentStatus === 'Deposit' ? 260 : 180), 0);

    return {
      revenue,
      checkedIn,
      issued,
      guestCount: state.guests.length,
      outstanding,
      upgradePotential: state.guests.length * 360,
    };
  }, [state.guests]);

  return { ...state, metrics, refresh: loadData };
}
