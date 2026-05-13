import { useState } from 'react';
import { KeyRound, ShieldCheck, Sparkles } from 'lucide-react';
import { useAuth } from '../context/AuthContext.jsx';

export default function Auth() {
  const { signInWithPassword, signUpWithPassword, authError } = useAuth();
  const [mode, setMode] = useState('sign-in');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [message, setMessage] = useState('');
  const [submitting, setSubmitting] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();
    setSubmitting(true);
    setMessage('');

    const action = mode === 'sign-up' ? signUpWithPassword : signInWithPassword;
    const { error } = await action({ email, password });

    if (!error) {
      setMessage(
        mode === 'sign-up'
          ? 'Account created. Check your email if confirmation is enabled, then run the bootstrap SQL to create your first client role.'
          : 'Signed in. Loading console data...',
      );
    }

    setSubmitting(false);
  }

  return (
    <main className="auth-shell">
      <div className="ambient ambient-one" />
      <div className="ambient ambient-two" />

      <section className="auth-card">
        <div className="auth-brand">
          <p className="eyebrow">Uriyel</p>
          <h1>Client Console</h1>
          <p>Sign in to load live Supabase data for guests, events, passes and sponsor reporting.</p>
        </div>

        <div className="auth-feature-grid">
          <div><ShieldCheck size={17} /> RLS-secured client data</div>
          <div><KeyRound size={17} /> Owner, admin and staff roles</div>
          <div><Sparkles size={17} /> Premium access operations</div>
        </div>

        <form className="auth-form" onSubmit={handleSubmit}>
          <label>
            Email
            <input value={email} onChange={(event) => setEmail(event.target.value)} type="email" required placeholder="you@example.com" />
          </label>
          <label>
            Password
            <input value={password} onChange={(event) => setPassword(event.target.value)} type="password" required minLength={6} placeholder="Minimum 6 characters" />
          </label>
          <button className="primary-button" disabled={submitting} type="submit">
            {submitting ? 'Please wait...' : mode === 'sign-up' ? 'Create owner account' : 'Sign in'}
          </button>
        </form>

        {(authError || message) && <p className={`auth-message ${authError ? 'error' : ''}`}>{authError || message}</p>}

        <button className="text-button" type="button" onClick={() => setMode(mode === 'sign-in' ? 'sign-up' : 'sign-in')}>
          {mode === 'sign-in' ? 'Need to create the first owner account?' : 'Already created the owner account?'}
        </button>
      </section>
    </main>
  );
}
