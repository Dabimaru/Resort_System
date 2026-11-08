import { useCallback, useEffect, useState } from 'react';
import { getUserProfile } from '../services/api';
import useLiveRefresh from '../hooks/useLiveRefresh';

export default function ProfilePage() {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const loadProfile = useCallback(async () => {
    const token = localStorage.getItem('azureCoveToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const response = await getUserProfile(token);
      setUser(response?.user || null);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load profile.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useLiveRefresh(loadProfile, {
    enabled: Boolean(localStorage.getItem('azureCoveToken')),
  });

  if (loading) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-center text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell">Loading profile...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell card-surface-elevated p-8 border-l-4 border-state-error">
          <h1 className="text-heading-xl">Unable to load profile</h1>
          <p className="mt-3 text-state-error">{error}</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-center text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell">
          <p className="text-text-secondary dark:text-dark-text-secondary">Please sign in to view your profile.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="section-shell space-y-8 max-w-2xl">
        <div>
          <span className="badge badge-info">Account</span>
          <h1 className="mt-4 text-heading-xl">My Profile</h1>
        </div>

        <div className="card-surface-elevated p-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-resort-500/20 text-2xl font-semibold text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">
              {user.name?.charAt(0).toUpperCase() || 'G'}
            </div>
            <div>
              <h2 className="text-heading-lg font-semibold text-text-primary dark:text-dark-text-primary">{user.name}</h2>
              <p className="text-text-secondary dark:text-dark-text-secondary">{user.email}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="card-surface p-4">
              <p className="text-caption text-text-muted dark:text-dark-text-muted">Role</p>
              <p className="mt-1 text-heading-sm font-medium text-text-primary dark:text-dark-text-primary">{user.role || 'customer'}</p>
            </div>
            <div className="card-surface p-4">
              <p className="text-caption text-text-muted dark:text-dark-text-muted">Member since</p>
              <p className="mt-1 text-heading-sm font-medium text-text-primary dark:text-dark-text-primary">
                {user.createdAt ? new Date(user.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long' }) : 'N/A'}
              </p>
            </div>
            <div className="card-surface p-4">
              <p className="text-caption text-text-muted dark:text-dark-text-muted">Last login</p>
              <p className="mt-1 text-heading-sm font-medium text-text-primary dark:text-dark-text-primary">
                {user.lastLoginAt ? new Date(user.lastLoginAt).toLocaleString() : 'Never'}
              </p>
            </div>
            <div className="card-surface p-4">
              <p className="text-caption text-text-muted dark:text-dark-text-muted">Account status</p>
              <p className="mt-1 text-heading-sm font-medium text-state-success">Active</p>
            </div>
          </div>
        </div>

        <div className="card-surface-elevated p-6">
          <h2 className="text-heading-md mb-4">Preferences</h2>
          <div className="space-y-3">
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-secondary dark:text-dark-text-secondary">Email notifications</span>
              <input type="checkbox" defaultChecked className="form-checkbox" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-secondary dark:text-dark-text-secondary">SMS updates</span>
              <input type="checkbox" className="form-checkbox" />
            </label>
            <label className="flex items-center justify-between cursor-pointer">
              <span className="text-text-secondary dark:text-dark-text-secondary">Marketing emails</span>
              <input type="checkbox" className="form-checkbox" />
            </label>
          </div>
        </div>
      </div>
    </div>
  );
}