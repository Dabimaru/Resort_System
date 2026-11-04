import { useTheme } from '../../context/ThemeContext';

export default function AdminHeader({ user, onSignOut }) {
  const { theme, toggleTheme } = useTheme();

  return (
    <header className="flex items-center justify-between rounded-3xl border border-border bg-surface-elevated p-4 dark:border-dark-border dark:bg-dark-surface-elevated">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Management portal</p>
        <h1 className="mt-1 text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Resort operations</h1>
      </div>

      <div className="flex items-center gap-3">
        <button
          onClick={toggleTheme}
          className="theme-toggle"
          aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
        >
          <svg className="theme-toggle-icon theme-toggle-moon" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <svg className="theme-toggle-icon theme-toggle-sun" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
          </svg>
        </button>

        <button type="button" className="rounded-full border border-border bg-surface text-text-secondary px-3 py-2 text-sm hover:border-border-strong dark:border-dark-border dark:bg-dark-surface dark:text-dark-text-secondary dark:hover:border-dark-border-strong">
          🔔 Alerts
        </button>
        <div className="flex items-center gap-3 rounded-full border border-border bg-surface px-3 py-2 dark:border-dark-border dark:bg-dark-surface">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-resort-500/20 text-sm font-semibold text-resort-600 dark:text-resort-400">
            {user?.name?.slice(0, 1).toUpperCase() || 'A'}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-text-primary dark:text-dark-text-primary">{user?.name || 'Admin'}</p>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">{user?.role || 'super-admin'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full border border-state-error/40 bg-state-error/10 px-3 py-2 text-sm text-state-error hover:bg-state-error/20 dark:border-state-error/40 dark:bg-state-error/10 dark:hover:bg-state-error/20"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}