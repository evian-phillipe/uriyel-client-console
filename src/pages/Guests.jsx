import { Search } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';

function paymentTone(status) {
  if (status === 'Paid' || status === 'Allocated') return 'good';
  if (status === 'Unpaid') return 'bad';
  if (status === 'Deposit') return 'warn';
  return 'neutral';
}

export default function Guests() {
  const { guests } = useOutletContext();
  const [query, setQuery] = useState('');

  const filteredGuests = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return guests;
    return guests.filter((guest) =>
      [guest.name, guest.email, guest.phone, guest.tier, guest.paymentStatus, guest.sponsor]
        .join(' ')
        .toLowerCase()
        .includes(q),
    );
  }, [query]);

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Guests" title="A private CRM for controlled access.">
        Each guest profile contains access tier, payment status, sponsor source, notes and check-in state.
      </SectionHeader>

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
              <th>Notes</th>
            </tr>
          </thead>
          <tbody>
            {filteredGuests.map((guest) => (
              <tr key={guest.id}>
                <td>
                  <strong>{guest.name}</strong>
                  <span>{guest.email}</span>
                </td>
                <td>{guest.tier}</td>
                <td><Pill tone={paymentTone(guest.paymentStatus)}>{guest.paymentStatus}</Pill></td>
                <td><Pill>{guest.accessStatus}</Pill></td>
                <td>{guest.sponsor}</td>
                <td>{guest.notes}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </section>
    </div>
  );
}
