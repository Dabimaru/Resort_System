import { useEffect, useState } from 'react';
import { loginUser, registerUser } from '../services/api';

export default function AuthPage() {
  const [mode, setMode] = useState('signin');

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const nextMode = params.get('mode');
    if (nextMode === 'signup') {
      setMode('signup');
    }
  }, []);

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });
  const [session, setSession] = useState(() => {
    const stored = localStorage.getItem('azureCoveToken');
    return stored ? { token: stored } : null;
  });

  const handleSignUp = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Creating your account...' });

    try {
      await registerUser({ name, email, password });
      setStatus({ type: 'success', message: 'Account created successfully. Please sign in with your email and password.' });
      setMode('signin');
      setPassword('');
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to create account.' });
    }
  };

  const handleSignIn = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Signing you in...' });

    try {
      const response = await loginUser({ email, password });
      localStorage.setItem('azureCoveToken', response.token);
      setSession({ token: response.token, user: response.user });
      setStatus({ type: 'success', message: `Welcome back, ${response.user.name}.` });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to sign in.' });
    }
  };

  const handleSignOut = () => {
    localStorage.removeItem('azureCoveToken');
    setSession(null);
    setStatus({ type: 'idle', message: 'Signed out.' });
  };

  return (
    <div className="min-h-screen bg-surface px-4 py-12 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="card-surface-elevated p-8">
          <span className="badge badge-primary">Guest access</span>
          <h1 className="mt-6 text-heading-xl">Secure resort access</h1>
          <p className="mt-4 text-body-lg text-text-secondary dark:text-dark-text-secondary">
            Create your account as a guest, then sign in to continue with reservations and booking checks.
          </p>

          <div className="mt-8 card-surface p-4 space-y-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
            <p className="font-medium text-text-primary dark:text-dark-text-primary">Customer account flow</p>
            <p>1. Sign up with your name, email, and password.</p>
            <p>2. Sign in with the same email and password.</p>
          </div>
        </div>

        <div className="card-surface-elevated p-8">
          <div className="mb-6 flex rounded-full border border-border bg-surface-elevated p-1 dark:border-dark-border dark:bg-dark-surface-elevated">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full px-4 py-2 text-body-sm font-medium transition ${mode === 'signin' ? 'bg-resort-500 text-text-inverse' : 'text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-4 py-2 text-body-sm font-medium transition ${mode === 'signup' ? 'bg-resort-500 text-text-inverse' : 'text-text-secondary hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary'}`}
            >
              Sign up
            </button>
          </div>

          {session ? (
            <div className="mt-6 space-y-3 card-surface p-4 border-l-4 border-state-success bg-state-success/5 dark:bg-state-success/10">
              <p className="text-state-success">Signed in successfully.</p>
              <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">Role: {session.user?.role || 'customer'}</p>
              <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">Name: {session.user?.name || 'Guest'}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 btn-secondary"
              >
                Sign out
              </button>
            </div>
          ) : mode === 'signup' ? (
            <form onSubmit={handleSignUp} className="mt-6 space-y-5">
              <div className="form-group">
                <label className="form-label" htmlFor="name">Full name</label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="form-input"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-email">Email</label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signup-password">Password</label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="form-input"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="btn-primary w-full"
              >
                {status.type === 'loading' ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="mt-6 space-y-5">
              <div className="form-group">
                <label className="form-label" htmlFor="signin-email">Email</label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="form-input"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="signin-password">Password</label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="form-input"
                  placeholder="Your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="btn-primary w-full"
              >
                {status.type === 'loading' ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {status.message && (
            <p className={`mt-4 text-body-sm ${status.type === 'error' ? 'text-state-error' : status.type === 'success' ? 'text-state-success' : 'text-text-muted'}`}>
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}