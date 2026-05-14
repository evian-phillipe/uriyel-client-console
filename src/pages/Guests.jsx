import { BadgeCheck, Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { manualIssuePass } from '../lib/manualPass.js';
import { getDefaultProductKeyForGuest, paymentProductMap } from '../lib/paymentProducts.js';

function paymentTone(status) {
  if (status === 'Paid' || status === 'Allocated' || status === 'Comped') return 'good';
  if (status === 'Unpaid') return 'bad';
  if (status === 'Deposit') return 'warn';
  return 'neutral';
}

function canManualIssue(guest) {
  return !['Paid', 'Allocated', 'Comped', 'Refunded'].includes(guest.paymentStatus);
}

function getManualActionLabel(guest, product) {
  const status = String(guest.paymentStatus || '').toLowerCase();

  if (status.includes('deposit')) return `Mark balance paid`;
  if (product.key === 'glamping_deposit') return `Record £${product.amountGbp} deposit`;
  if (product.amountGbp === 0) return 'Issue allocation';
  return `Mark paid`;
}

export default function Guests() {
  const { guests, mode, refresh } = useOutletContext();
  const { session } = useAuth();
  const [query, setQuery] = useState('');
  const [actionState, setActionState] = useState({ guestId: '', error: '', success: '' });

  const filteredGuests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((guest) =>
      [guest.name, guest.email, guest.phone, guest.tier, guest.paymentStatus, guest.sponsor]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [guests, query]);

  async function handleManualIssue(guest) {
    const productKey = getDefaultProductKeyForGuest(guest);
    const product = paymentProductMap[productKey];

    const confirmation =
      product.amountGbp > 0
        ? `Confirm manual payment for ${guest.name}: £${product.amountGbp} — ${product.label}?`
        : `Issue ${product.label} pass for ${guest.name}?`;

    if (!window.confirm(confirmation)) return;

    setActionState({ guestId: guest.id, error: '', success: '' });

    try {
      const result = await manualIssuePass({
        accessToken: session?.access_token,
        guestId: guest.id,
        productKey,
      });

      await refresh?.();

      setActionState({
        guestId: '',
        error: '',
        success: result.message || 'Pass updated successfully.',
      });
    } catch (error) {
      setActionState({
        guestId: '',
        error: error.message || 'Could not issue pass.',
        success: '',
      });
    }
  }

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Guests" title="A private CRM for controlled access.">
        Each guest profile contains access tier, payment status, sponsor source, notes and check-in state.
      </SectionHeader>

      {actionState.error && <div className="status-banner error">{actionState.error}</div>}
      {actionState.success && <div className="status-banner success">{actionState.success}</div>}

      <div className="search-box">
        <Search size={16} />
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Search guests, tiers, status, sponsor or phone..."
        />
      </div>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Tier</th>
              <th>Payment</th>
              <th>Access</th>
              <th>Sponsor</th>
              <th>Manual action</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest) => {
              const productKey = getDefaultProductKeyForGuest(guest);
              const product = paymentProductMap[productKey];
              const isBusy = actionState.guestId === guest.id;

              return (
                <tr key={guest.id}>
                  <td>
                    <strong>{guest.name}</strong>
                    <span>{guest.email}</span>
                  </td>
                  <td>{guest.tier}</td>
                  <td><Pill tone={paymentTone(guest.paymentStatus)}>{guest.paymentStatus}</Pill></td>
                  <td><Pill>{guest.accessStatus}</Pill></td>
                  <td>{guest.sponsor}</td>
                  <td>
                    {canManualIssue(guest) ? (
                      <button
                        className="mini-button"
                        type="button"
                        disabled={mode !== 'live' || isBusy}
                        onClick={() => handleManualIssue(guest)}
                        title={mode !== 'live' ? 'Live Supabase mode required' : product.description}
                      >
                        <BadgeCheck size={14} />
                        {isBusy ? 'Issuing...' : getManualActionLabel(guest, product)}
                      </button>
                    ) : (
                      <span className="muted-action">Already active</span>
                    )}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </section>
    </div>
  );
}
