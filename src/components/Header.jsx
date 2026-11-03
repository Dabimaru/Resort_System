import { Link, useLocation } from 'react-router-dom';
import { useEffect, useState } from 'react';
import { resortData } from '../data/resortData';

const navItems = [
  { label: 'Stay', target: 'stay' },
  { label: 'Suites', target: 'suites' },
  { label: 'Experiences', target: 'experiences' },
  { label: 'Dining', target: 'dining' },
  { label: 'Wellness', target: 'wellness' },
];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const location = useLocation();

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
    <header className="sticky top-0 z-50 border-b border-border bg-surface/80 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-resort-500/20 text-lg font-semibold text-resort-200">
            A
          </div>
          <div>
            <p className="text-lg font-semibold text-text-primary">{resortData.company}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`/#${item.target}`}
              className="text-body-sm text-text-secondary transition hover:text-text-primary"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          {isLoggedIn ? (
            <>
              <Link
                to="/my-bookings"
                className="btn-ghost btn-sm"
              >
                My Bookings
              </Link>
              <Link
                to="/checkout"
                className="btn-outline btn-sm"
              >
                Checkout
              </Link>
              <Link
                to="/profile"
                className="btn-outline btn-sm"
              >
                Profile
              </Link>
              <button
                onClick={handleSignOut}
                className="btn-danger btn-sm"
              >
                Sign out
              </button>
            </>
          ) : (
            <>
              <Link
                to="/checkout"
                className="btn-ghost btn-sm hidden"
              >
                Checkout
              </Link>
              <Link
                to="/auth"
                className="btn-primary btn-sm"
              >
                Guest login
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
