import { NavLink, Outlet } from 'react-router-dom';
import {
  BadgeCheck,
  Banknote,
  CircleDollarSign,
  Download,
  KeyRound,
  LayoutDashboard,
  QrCode,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
  Users,
} from 'lucide-react';
import { useConsoleData } from '../hooks/useConsoleData.js';
import { useAuth } from '../context/AuthContext.jsx';

const navItems = [
  { to: '/dashboard', label: 'Overview', icon: LayoutDashboard },
  { to: '/sales', label: 'Sales', icon: CircleDollarSign },
  { to: '/guests', label: 'Guests', icon: Users },
  { to: '/access', label: 'Access', icon: QrCode },
  { to: '/sponsors', label: 'Sponsors', icon: BadgeCheck },
  { to: '/settings', label: 'Settings', icon: SlidersHorizontal },
];

export default function Layout() {
  const consoleData = useConsoleData();
  const { user, signOut, hasSupabaseConfig } = useAuth();
  const { client, loading, error, mode } = consoleData;

  return (
    <main className="app-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <aside className="sidebar">
        <section className="brand-card">
          <p className="eyebrow">Uriyel</p>
          <h2>Client Console</h2>
          <p>Private access, payments, sponsor perks and guest intelligence in one controlled layer.</p>
        </section>

        <nav className="nav-list" aria-label="Uriyel console navigation">
          {navItems.map((item) => {
            const Icon = item.icon;
            return (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
              >
                <Icon size={17} />
                <span>{item.label}</span>
              </NavLink>
            );
          })}
        </nav>

        <section className="premium-card">
          <div>
            <ShieldCheck size={22} />
            <strong>Premium mode</strong>
          </div>
          <p>Built for invite-only releases, VIP allocations and sponsor-visible reporting.</p>
        </section>
      </aside>

      <section className="main-panel">
        <header className="topbar">
          <div>
            <p className="eyebrow">{client.name} / {client.status} / {mode === 'live' ? 'Live Supabase' : 'Demo data'}</p>
            <h1>{client.eventName}</h1>
            <p>{client.dateLabel}</p>
          </div>
          <div className="topbar-actions">
            {user && (
              <button className="ghost-button" type="button" onClick={signOut}>
                <KeyRound size={15} />
                Sign out
              </button>
            )}
            {!hasSupabaseConfig && (
              <button className="ghost-button" type="button">
                <KeyRound size={15} />
                Demo mode
              </button>
            )}
            <button className="primary-button" type="button">
              <Download size={15} />
              Sponsor PDF
            </button>
          </div>
        </header>

        {loading && <div className="status-banner">Loading live console data...</div>}
        {error && <div className="status-banner error">{error}</div>}
        <Outlet context={consoleData} />
      </section>
    </main>
  );
}
