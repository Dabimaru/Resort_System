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
      navigate('/admin/dashboard', { replace: true });
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
      navigate('/admin/dashboard', { replace: true });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to sign in.' });
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface px-4 py-12 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="w-full max-w-xl card-surface-elevated p-8 shadow-elevation-4">
        <div className="mb-8">
          <p className="text-caption text-resort-500">Restricted access</p>
          <h1 className="mt-4 text-heading-xl">Super Admin portal</h1>
          <p className="mt-3 text-text-secondary dark:text-dark-text-secondary">Use the local development administrator account to access the management dashboard.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div className="form-group">
            <label className="form-label" htmlFor="admin-identifier">Username / Email</label>
            <input
              id="admin-identifier"
              type="text"
              value={identifier}
              onChange={(event) => setIdentifier(event.target.value)}
              className="form-input"
              placeholder="admin / admin@resort.local"
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label" htmlFor="admin-password">Password</label>
            <input
              id="admin-password"
              type="password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="form-input"
              placeholder="Enter admin password"
              required
            />
          </div>

          <button type="submit" className="btn-primary w-full">
            {status.type === 'loading' ? 'Signing in...' : 'Access dashboard'}
          </button>
        </form>

        {status.message && (
          <p className={`mt-4 text-body-sm ${status.type === 'error' ? 'text-state-error' : status.type === 'success' ? 'text-state-success' : 'text-text-muted'}`}>
            {status.message}
          </p>
        )}
      </div>
    </div>
  );
}