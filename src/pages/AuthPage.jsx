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
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.8fr_1.2fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-resort-200">
            Guest access
          </span>
          <h1 className="mt-6 text-4xl font-semibold">Secure resort access</h1>
          <p className="mt-4 text-slate-300">
            Create your account as a guest, then sign in to continue with reservations and booking checks.
          </p>

          <div className="mt-8 rounded-2xl border border-white/10 bg-white/5 p-4 text-sm text-slate-300">
            <p className="font-medium text-white">Customer account flow</p>
            <p className="mt-2">1. Sign up with your name, email, and password.</p>
            <p>2. Sign in with the same email and password.</p>
          </div>
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <div className="mb-6 flex rounded-full border border-white/10 bg-slate-950 p-1">
            <button
              type="button"
              onClick={() => setMode('signin')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'signin' ? 'bg-resort-500 text-slate-950' : 'text-slate-300'}`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => setMode('signup')}
              className={`flex-1 rounded-full px-4 py-2 text-sm font-medium transition ${mode === 'signup' ? 'bg-resort-500 text-slate-950' : 'text-slate-300'}`}
            >
              Sign up
            </button>
          </div>

          {session ? (
            <div className="mt-6 space-y-4 rounded-2xl border border-emerald-400/30 bg-emerald-500/10 p-5">
              <p className="text-emerald-200">Signed in successfully.</p>
              <p className="text-sm text-slate-300">Role: {session.user?.role || 'customer'}</p>
              <p className="text-sm text-slate-300">Name: {session.user?.name || 'Guest'}</p>
              <button
                type="button"
                onClick={handleSignOut}
                className="mt-2 rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 transition hover:bg-slate-200"
              >
                Sign out
              </button>
            </div>
          ) : mode === 'signup' ? (
            <form onSubmit={handleSignUp} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-200" htmlFor="name">
                  Full name
                </label>
                <input
                  id="name"
                  type="text"
                  value={name}
                  onChange={(event) => setName(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-resort-400"
                  placeholder="Your full name"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-200" htmlFor="signup-email">
                  Email
                </label>
                <input
                  id="signup-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-resort-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-200" htmlFor="signup-password">
                  Password
                </label>
                <input
                  id="signup-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-resort-400"
                  placeholder="Create a password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-resort-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status.type === 'loading' ? 'Creating account...' : 'Create account'}
              </button>
            </form>
          ) : (
            <form onSubmit={handleSignIn} className="mt-6 space-y-5">
              <div>
                <label className="mb-2 block text-sm text-slate-200" htmlFor="signin-email">
                  Email
                </label>
                <input
                  id="signin-email"
                  type="email"
                  value={email}
                  onChange={(event) => setEmail(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-resort-400"
                  placeholder="you@example.com"
                  required
                />
              </div>

              <div>
                <label className="mb-2 block text-sm text-slate-200" htmlFor="signin-password">
                  Password
                </label>
                <input
                  id="signin-password"
                  type="password"
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none ring-0 transition focus:border-resort-400"
                  placeholder="Your password"
                  required
                />
              </div>

              <button
                type="submit"
                disabled={status.type === 'loading'}
                className="w-full rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-resort-400 disabled:cursor-not-allowed disabled:opacity-70"
              >
                {status.type === 'loading' ? 'Signing in...' : 'Sign in'}
              </button>
            </form>
          )}

          {status.message && (
            <p
              className={`mt-4 text-sm ${
                status.type === 'error' ? 'text-red-300' : status.type === 'success' ? 'text-emerald-300' : 'text-slate-300'
              }`}
            >
              {status.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
