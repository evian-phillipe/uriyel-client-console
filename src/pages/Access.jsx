import { BadgeCheck, ExternalLink, QrCode, ShieldCheck } from 'lucide-react';
import { useMemo, useState } from 'react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';
import { accessRules } from '../data/mockData.js';

function accessTone(status) {
  if (['Issued', 'Activated', 'Checked In'].includes(status)) return 'good';
  if (status === 'Pending Balance' || status === 'Reserved') return 'warn';
  if (status === 'Not Issued') return 'bad';
  return 'neutral';
}

export default function Access() {
  const { guests } = useOutletContext();
  const passGuests = useMemo(
    () => guests.filter((guest) => guest.accessStatus !== 'Not Issued' || guest.passCode || guest.qrDataUrl),
    [guests],
  );

  const firstIssued = passGuests.find((guest) => ['Issued', 'Activated', 'Checked In'].includes(guest.accessStatus));
  const [selectedGuestId, setSelectedGuestId] = useState('');

  const selectedGuest =
    passGuests.find((guest) => guest.id === selectedGuestId) ||
    firstIssued ||
    passGuests[0] ||
    guests[0];

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Access" title="Pass directory, QR confirmation and event-day scan mode.">
        Select an issued or reserved guest pass to confirm its QR code, pass code, payment state and access status.
      </SectionHeader>

      <section className="split-grid equal">
        <article className="panel-card qr-panel">
          <div className="qr-preview">
            {selectedGuest?.qrDataUrl ? (
              <img
                src={selectedGuest.qrDataUrl}
                alt={`${selectedGuest.name} Uriyel QR pass`}
                className="qr-image"
              />
            ) : (
              <QrCode size={128} />
            )}
          </div>

          <h2>{selectedGuest ? selectedGuest.name : 'No pass selected'}</h2>
          <p>
            {selectedGuest
              ? `${selectedGuest.tier}. ${selectedGuest.paymentStatus}. ${selectedGuest.accessStatus}.`
              : 'Issue a pass from Guests to generate a QR code.'}
          </p>

          <div className="package-pills centered">
            <Pill tone={accessTone(selectedGuest?.accessStatus)}>{selectedGuest?.accessStatus || 'Pending'}</Pill>
            <Pill>{selectedGuest?.tier || 'Tier'}</Pill>
            <Pill>{selectedGuest?.passCode || 'No pass code'}</Pill>
          </div>

          {selectedGuest?.passUrl && (
            <a className="ghost-link" href={selectedGuest.passUrl} target="_blank" rel="noreferrer">
              <ExternalLink size={14} />
              Open pass link
            </a>
          )}
        </article>

        <article className="panel-card">
          <div className="panel-heading-row compact">
            <div>
              <p className="eyebrow">Rules</p>
              <h2>Access logic</h2>
            </div>
            <ShieldCheck size={24} />
          </div>
          <div className="rule-list">
            {accessRules.map((rule) => (
              <div className="rule-item" key={rule.title}>
                <BadgeCheck size={18} />
                <div>
                  <strong>{rule.title}</strong>
                  <p>{rule.description}</p>
                </div>
              </div>
            ))}
          </div>
        </article>
      </section>

      <section className="table-card">
        <table>
          <thead>
            <tr>
              <th>Guest</th>
              <th>Tier</th>
              <th>Payment</th>
              <th>Access</th>
              <th>Pass code</th>
              <th>QR</th>
            </tr>
          </thead>
          <tbody>
            {passGuests.map((guest) => (
              <tr
                key={guest.id}
                className={selectedGuest?.id === guest.id ? 'selected-row' : ''}
                onClick={() => setSelectedGuestId(guest.id)}
              >
                <td>
                  <strong>{guest.name}</strong>
                  <span>{guest.email}</span>
                </td>
                <td>{guest.tier}</td>
                <td><Pill>{guest.paymentStatus}</Pill></td>
                <td><Pill tone={accessTone(guest.accessStatus)}>{guest.accessStatus}</Pill></td>
                <td>{guest.passCode || '—'}</td>
                <td>{guest.qrDataUrl ? 'Generated' : 'Pending'}</td>
              </tr>
            ))}
            {!passGuests.length && (
              <tr>
                <td colSpan="6">
                  <strong>No passes yet</strong>
                  <span>Use Guests → Manual Action to issue or reserve a pass.</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
