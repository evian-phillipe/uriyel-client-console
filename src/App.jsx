import Layout from './components/Layout.jsx';
import Auth from './pages/Auth.jsx';
import { useAuth } from './context/AuthContext.jsx';

export default function App() {
  const { user, authLoading, hasSupabaseConfig } = useAuth();

  if (authLoading) {
    return (
      <main className="auth-shell">
        <section className="auth-card compact">
          <p className="eyebrow">Uriyel</p>
          <h1>Loading console</h1>
          <p>Checking Supabase session...</p>
        </section>
      </main>
    );
  }

  if (hasSupabaseConfig && !user) {
    return <Auth />;
  }

  return <Layout />;
}
