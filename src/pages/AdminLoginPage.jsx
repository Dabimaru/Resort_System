import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { adminLogin } from '../services/api';

export default function AdminLoginPage() {
  const navigate = useNavigate();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [status, setStatus] = useState({ type: 'idle', message: '' });

  useEffect(() => {
    const token = localStorage.getItem('resortAdminToken');
    const user = localStorage.getItem('resortAdminUser');

    if (token && user) {
      navigate('/admin/roles', { replace: true });
    }
  }, [navigate]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    setStatus({ type: 'loading', message: 'Authenticating administrator...' });

    try {
      const response = await adminLogin({ username: identifier, email: identifier.includes('@') ? identifier : 'admin@resort.local', password });
      localStorage.setItem('resortAdminToken', response.token);
      localStorage.setItem('resortAdminUser', JSON.stringify(response.user));
      setStatus({ type: 'success', message: 'Admin login successful.' });
      navigate('/admin/roles', { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to sign in.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-slate-950 px-4 py-12 text-white">
      <div className="w-full max-w-xl rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/50">
        <div className="mb-8">
          <p className="text-xs uppercase tracking-[0.25em] text-resort-200">Restricted access</p>
          <h1 className="mt-4 text-4xl font-semibold">Super Admin portal</h1>
          <p className="mt-3 text-slate-300">Use the local development administrator account to access the management dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label className="mb-2 block text-sm text-slate-200" htmlFor="admin-identifier">Username / Email</label>
            <input
              id="admin-identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400"
              placeholder="admin / admin@resort.local"
              required
            />
          </div>

          <div>
            <label className="mb-2 block text-sm text-slate-200" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white outline-none focus:border-resort-400"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="w-full rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-slate-950 hover:bg-resort-400">
            {status.type === 'loading' ? 'Signing in...' : 'Access dashboard'}
          </button>
        </form>

        {status.message && (
          <p className={`mt-4 text-sm ${status.type === 'error' ? 'text-red-300' : status.type === 'success' ? 'text-emerald-300' : 'text-slate-300'}`}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}
