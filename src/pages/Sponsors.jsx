import { FileText } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';

export default function Sponsors() {
  const { sponsorPerks } = useOutletContext();

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Sponsors" title="Turn perks into measurable partner value.">
        The premium leap is sponsor reporting: allocations, redemptions, VIP engagement and a polished post-event export.
      </SectionHeader>

      <section className="sponsor-list">
        {sponsorPerks.map((item) => {
          const percent = item.issued > 0 ? Math.round((item.redeemed / item.issued) * 100) : 0;
          return (
            <article className="sponsor-card" key={item.id}>
              <div className="sponsor-heading">
                <div>
                  <h2>{item.sponsor}</h2>
                  <p>{item.perk}</p>
                </div>
                <Pill tone="good">{percent}% redeemed</Pill>
              </div>
              <div className="progress-track">
                <div style={{ width: `${percent}%` }} />
              </div>
              <div className="sponsor-footer">
                <span>{item.issued} issued</span>
                <span>{item.redeemed} redeemed</span>
                <span>{item.value}</span>
              </div>
            </article>
          );
        })}
      </section>

      <section className="panel-card report-card">
        <FileText size={28} />
        <div>
          <p className="eyebrow">Next build</p>
          <h2>Sponsor PDF generator</h2>
          <p>Export partner-ready reports showing guest allocation, redemption proof, VIP engagement and event attendance.</p>
        </div>
        <button className="primary-button" type="button">Generate preview</button>
      </section>
    </div>
  );
}
