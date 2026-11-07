import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { useTheme } from '../context/ThemeContext';
import { resortData } from '../data/resortData';

const navItems = [
  { label: 'Stay', target: 'stay' },
  { label: 'Suites', target: 'suites' },
  { label: 'Experiences', target: 'experiences' },
  { label: 'Gallery', target: 'gallery' },
  { label: 'Reviews', target: 'reviews' },
];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = () => {
      const token = localStorage.getItem('azureCoveToken');
      setIsLoggedIn(!!token);
    };
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [location.pathname]);

  const handleSignOut = () => {
    localStorage.removeItem('azureCoveToken');
    setIsLoggedIn(false);
    if (location.pathname === '/checkout' || location.pathname.startsWith('/auth')) {
      window.location.href = '/';
    }
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl dark:border-dark-border dark:bg-dark-surface/80">
      <div className="section-shell flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-resort-500/20 text-lg font-semibold text-resort-600 dark:text-resort-400">
            A
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">{resortData.company}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => {
            const isActive = location.hash === `#${item.target}`;

            return (
              <Link
                key={item.label}
                to={`/#${item.target}`}
                className={
                  isActive
                    ? 'text-body-sm font-semibold text-resort-600 dark:text-resort-400'
                    : 'text-body-sm text-text-secondary transition hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary'
                }
              >
                {item.label}
              </Link>
            );
          })}
        </nav>

        <div className="flex items-center gap-3">
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="md:hidden p-2 rounded-lg text-text-secondary dark:text-dark-text-secondary hover:bg-surface/40 dark:hover:bg-dark-surface/40 focus:outline-none"
            aria-label="Toggle navigation menu"
          >
            {mobileOpen ? (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
            ) : (
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            )}
          </button>

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

          {isLoggedIn ? (
            <>
              <Link to="/my-bookings" className="btn-ghost btn-sm">
                My Bookings
              </Link>
              <Link to="/checkout" className="btn-outline btn-sm">
                Checkout
              </Link>
              <Link to="/profile" className="btn-outline btn-sm">
                Profile
              </Link>
              <button onClick={handleSignOut} className="btn-danger btn-sm">
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link to="/checkout" className="btn-ghost btn-sm hidden">
                Checkout
              </Link>
              <Link to="/auth" className="btn-primary btn-sm">
                Guest login
              </Link>
            </>
          )}
        </div>

        {mobileOpen && (
          <div className="fixed inset-0 z-[600] flex flex-col p-6 gap-4 md:hidden bg-surface/95 dark:bg-dark-surface/95 backdrop-blur-xl">
            <div className="flex items-center justify-between mb-6">
              <span className="font-semibold text-text-primary dark:text-dark-text-primary">Menu</span>
              <button
                onClick={() => setMobileOpen(false)}
                className="p-1.5 rounded-lg hover:bg-surface/40 dark:hover:bg-dark-surface/40 text-text-secondary dark:text-dark-text-secondary focus:outline-none"
                aria-label="Close menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <nav className="space-y-3">
              {navItems.map((item) => {
                const isActive = location.hash === `#${item.target}`;

                return (
                  <Link
                    key={item.label}
                    to={`/#${item.target}`}
                    onClick={() => setMobileOpen(false)}
                    className={`block px-4 py-2.5 rounded-lg text-body-sm ${isActive ? 'bg-resort-500/10 text-resort-600 dark:text-resort-400' : 'text-text-secondary dark:text-dark-text-secondary hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface/40 dark:hover:bg-dark-surface/40'}`}
                  >
                    {item.label}
                  </Link>
                );
              })}
            </nav>
            <div className="mt-6 space-y-3 pt-6 border-t border-border dark:border-dark-border">
              {isLoggedIn ? (
                <>
                  <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-lg bg-resort-600 dark:bg-resort-500 text-text-inverse hover:bg-resort-500 dark:hover:bg-resort-400">
                    My Bookings
                  </Link>
                  <Link to="/checkout" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-lg text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface/40 dark:hover:bg-dark-surface/40">
                    Checkout
                  </Link>
                  <Link to="/profile" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-lg text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface/40 dark:hover:bg-dark-surface/40">
                    Profile
                  </Link>
                  <button onClick={() => { setMobileOpen(false); handleSignOut(); }} className="block w-full text-center py-2.5 rounded-lg text-state-error border border-state-error/30 hover:bg-state-error/10 dark:hover:bg-state-error/5">
                    Sign out
                  </button>
                </>
              ) : (
                <>
                  <Link to="/checkout" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-lg text-text-secondary dark:text-dark-text-secondary border border-border dark:border-dark-border hover:text-text-primary dark:hover:text-dark-text-primary hover:bg-surface/40 dark:hover:bg-dark-surface/40">
                    Checkout
                  </Link>
                  <Link to="/auth" onClick={() => setMobileOpen(false)} className="block w-full text-center py-2.5 rounded-lg bg-resort-600 dark:bg-resort-500 text-text-inverse hover:bg-resort-500 dark:hover:bg-resort-400">
                    Guest login
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
}