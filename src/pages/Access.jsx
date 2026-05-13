import { BadgeCheck, QrCode, ShieldCheck } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';
import { accessRules } from '../data/mockData.js';

export default function Access() {
  const { guests } = useOutletContext();
  const previewGuest = guests.find((guest) => guest.accessStatus !== 'Not Issued') || guests[0];

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Access" title="Issue, scan and verify without losing the premium feel.">
        Staff need a clean event-day mode: scan QR, confirm guest, mark check-in, redeem perks and detect duplicates.
      </SectionHeader>

      <section className="split-grid equal">
        <article className="panel-card qr-panel">
          <div className="qr-preview">
            <QrCode size={128} />
          </div>
          <h2>Door scan preview</h2>
          <p>{previewGuest ? `${previewGuest.name}. ${previewGuest.tier}. ${previewGuest.accessStatus}.` : 'No guest pass found yet.'}</p>
          <div className="package-pills centered">
            <Pill tone="good">Valid</Pill>
            <Pill>{previewGuest?.tier || 'Tier'}</Pill>
            <Pill>{previewGuest?.accessStatus || 'Pending'}</Pill>
          </div>
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
    </div>
  );
}
