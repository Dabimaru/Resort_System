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
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`/#${item.target}`}
              className="text-body-sm text-text-secondary transition hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

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
      </div>
    </header>
  );
}