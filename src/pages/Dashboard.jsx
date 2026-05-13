import { Banknote, QrCode, Sparkles, TicketCheck, Users } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import MetricCard from '../components/MetricCard.jsx';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';

export default function Dashboard() {
  const { guests, metrics, mode } = useOutletContext();
  const { revenue, checkedIn, issued, guestCount } = metrics;

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Commercial console" title="A revenue-control layer, not just a pass system.">
        V1 gives a client visibility over what has been sold, who has access, which perks were redeemed and what sponsors can be shown after the event. The console is currently running in {mode === 'live' ? 'live Supabase mode' : 'demo mode'}.
      </SectionHeader>

      <section className="metric-grid four">
        <MetricCard label="Gross revenue" value={`£${revenue.toLocaleString()}`} detail="Deposits, upgrades and paid allocations." icon={Banknote} />
        <MetricCard label="Guest records" value={guestCount} detail="Private profiles, tiers, notes and sponsors." icon={Users} />
        <MetricCard label="Passes issued" value={issued} detail="QR access objects ready for door scan." icon={TicketCheck} />
        <MetricCard label="Checked in" value={`${checkedIn}/${guestCount}`} detail="Live attendance and proof layer." icon={QrCode} />
      </section>

      <section className="split-grid">
        <article className="panel-card large">
          <h2>Build priority</h2>
          <div className="priority-list">
            {[
              ['1', 'Sales', 'Stripe Checkout for deposits, full payments and VIP upgrades.'],
              ['2', 'Guests', 'Client-owned guest CRM with payment and access status.'],
              ['3', 'Access', 'QR issue, scan, check-in and proof-of-attendance.'],
              ['4', 'Sponsors', 'Perk issue, redemption and premium PDF reporting.'],
            ].map(([step, title, body]) => (
              <div className="priority-item" key={step}>
                <span>{step}</span>
                <div>
                  <strong>{title}</strong>
                  <p>{body}</p>
                </div>
              </div>
            ))}
          </div>
        </article>

        <article className="panel-card package-card">
          <Sparkles size={24} />
          <p className="eyebrow">Target package</p>
          <h2>£15k–£25k</h2>
          <p>Setup fee target for a white-label access suite with payment, guest, scan and sponsor-reporting modules.</p>
          <div className="package-pills">
            <Pill>Monthly licence</Pill>
            <Pill>Event support</Pill>
            <Pill>Platform fee</Pill>
          </div>
        </article>
      </section>
    </div>
  );
}
