import { Database, LockKeyhole, RefreshCw, Webhook } from 'lucide-react';
import { useOutletContext } from 'react-router-dom';
import SectionHeader from '../components/SectionHeader.jsx';
import Pill from '../components/Pill.jsx';
import { useAuth } from '../context/AuthContext.jsx';

const settings = [
  {
    icon: Database,
    title: 'Supabase project',
    description: 'Connect guests, events, passes and sponsor redemption tables.',
    status: 'Day 2',
  },
  {
    icon: LockKeyhole,
    title: 'Auth and roles',
    description: 'Owner, client admin, staff and sponsor-view permissions.',
    status: 'Day 3',
  },
  {
    icon: Webhook,
    title: 'Stripe webhook',
    description: 'Confirm payments and trigger pass issue after checkout completion.',
    status: 'Day 6',
  },
];

export default function Settings() {
  const { refresh, mode, event } = useOutletContext();
  const { user, hasSupabaseConfig } = useAuth();

  return (
    <div className="page-stack">
      <SectionHeader eyebrow="Settings" title="Infrastructure hooks for the real console.">
        This page is the bridge from the UI mock-up to the live system: database, auth, Stripe and webhooks.
      </SectionHeader>

      <section className="settings-grid">
        {settings.map((item) => {
          const Icon = item.icon;
          return (
            <article className="panel-card setting-card" key={item.title}>
              <div className="icon-box"><Icon size={20} /></div>
              <h2>{item.title}</h2>
              <p>{item.description}</p>
              <Pill>{item.status}</Pill>
            </article>
          );
        })}
      </section>

      <section className="panel-card">
        <div className="panel-heading-row">
          <div>
            <p className="eyebrow">Connection status</p>
            <h2>{hasSupabaseConfig ? 'Supabase environment detected' : 'Demo mode - no Supabase env variables yet'}</h2>
            <p>{user ? `Signed in as ${user.email}` : 'No signed-in Supabase user.'}</p>
            <p>{event ? `Current event id: ${event.id}` : 'No live event loaded yet.'}</p>
            <p>Mode: {mode}</p>
          </div>
          <button className="ghost-button" type="button" onClick={refresh}>
            <RefreshCw size={15} />
            Refresh data
          </button>
        </div>
      </section>
    </div>
  );
}
