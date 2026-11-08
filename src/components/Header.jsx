import { useEffect, useRef, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useTheme } from '../context/ThemeContext';
import { resortData } from '../data/resortData';

const navItems = [
  { label: 'The resort', target: 'stay' },
  { label: 'Suites', target: 'suites' },
  { label: 'Experiences', target: 'experiences' },
  { label: 'Gallery', target: 'gallery' },
  { label: 'Guest stories', target: 'reviews' },
];

export default function Header() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [accountOpen, setAccountOpen] = useState(false);
  const [activeSection, setActiveSection] = useState('stay');
  const accountMenuRef = useRef(null);
  const location = useLocation();
  const navigate = useNavigate();
  const { theme, toggleTheme } = useTheme();

  useEffect(() => {
    const checkAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('azureCoveToken')));
    checkAuth();
    window.addEventListener('storage', checkAuth);
    window.addEventListener('focus', checkAuth);
    return () => {
      window.removeEventListener('storage', checkAuth);
      window.removeEventListener('focus', checkAuth);
    };
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
    setAccountOpen(false);
  }, [location.pathname, location.hash]);

  useEffect(() => {
    if (!accountOpen) return undefined;

    const handlePointerDown = (event) => {
      if (!accountMenuRef.current?.contains(event.target)) {
        setAccountOpen(false);
      }
    };
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') {
        setAccountOpen(false);
      }
    };

    document.addEventListener('pointerdown', handlePointerDown);
    window.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('pointerdown', handlePointerDown);
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [accountOpen]);

  useEffect(() => {
    if (location.pathname !== '/') {
      setActiveSection('');
      return undefined;
    }

    const sections = navItems
      .map(({ target }) => document.getElementById(target))
      .filter(Boolean);

    if (!sections.length || !('IntersectionObserver' in window)) {
      return undefined;
    }

    const observer = new IntersectionObserver((entries) => {
      const visibleSections = entries
        .filter((entry) => entry.isIntersecting)
        .sort((a, b) => b.intersectionRatio - a.intersectionRatio);
      if (visibleSections[0]) {
        setActiveSection(visibleSections[0].target.id);
      }
    }, {
      rootMargin: '-28% 0px -58% 0px',
      threshold: [0, 0.15, 0.4],
    });

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [location.pathname]);

  useEffect(() => {
    if (!mobileOpen) return undefined;
    const handleKeyDown = (event) => {
      if (event.key === 'Escape') setMobileOpen(false);
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [mobileOpen]);

  const handleSignOut = () => {
    localStorage.removeItem('azureCoveToken');
    setIsLoggedIn(false);
    setMobileOpen(false);
    setAccountOpen(false);
    navigate('/auth', { replace: true });
  };

  const renderNavLinks = (mobile = false) => navItems.map((item) => {
    const isActive = activeSection === item.target && location.pathname === '/';
    return (
      <Link
        key={item.target}
        to={`/#${item.target}`}
        aria-current={isActive ? 'location' : undefined}
        onClick={() => mobile && setMobileOpen(false)}
        className={mobile
          ? `block border-b border-border py-3.5 text-lg ${isActive ? 'font-medium text-resort-700 dark:text-resort-300' : 'text-text-primary dark:text-dark-text-primary'}`
          : `site-nav-link ${isActive ? 'site-nav-link-active' : ''}`}
      >
        {item.label}
      </Link>
    );
  });

  return (
    <header className="site-header sticky top-0 z-50 border-b border-border/80 bg-surface/95 backdrop-blur-md dark:border-dark-border dark:bg-dark-surface/95">
      <div className="section-shell flex h-[76px] items-center justify-between gap-5">
        <Link to="/" className="site-brand shrink-0" aria-label={`${resortData.company} home`}>
          <span className="site-brand-mark" aria-hidden="true">
            <svg viewBox="0 0 40 40" fill="none">
              <path d="M5 24.5c4.2 0 4.2-4 8.4-4s4.2 4 8.4 4 4.2-4 8.4-4 4.2 4 8.4 4" />
              <path d="M5 31c4.2 0 4.2-4 8.4-4s4.2 4 8.4 4 4.2-4 8.4-4 4.2 4 8.4 4" />
              <path d="M20 5.5v11m-5.5-5.5H25.5" />
            </svg>
          </span>
          <span className="leading-tight">
            <span className="site-brand-name">Azure Cove</span>
            <span className="site-brand-subtitle">Resort &amp; Spa</span>
          </span>
        </Link>

        <nav className="hidden items-center gap-7 xl:flex" aria-label="Main navigation">
          {renderNavLinks()}
        </nav>

        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={toggleTheme}
            className="site-icon-button site-theme-button"
            aria-label={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
            title={theme === 'light' ? 'Switch to dark mode' : 'Switch to light mode'}
          >
            {theme === 'light' ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.7" d="M20.2 15.1A8.5 8.5 0 0 1 8.9 3.8 8.5 8.5 0 1 0 20.2 15.1Z" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <circle cx="12" cy="12" r="3.7" strokeWidth="1.7" />
                <path strokeLinecap="round" strokeWidth="1.7" d="M12 2v2m0 16v2M4.93 4.93l1.42 1.42m11.3 11.3 1.42 1.42M2 12h2m16 0h2M4.93 19.07l1.42-1.42m11.3-11.3 1.42-1.42" />
              </svg>
            )}
          </button>

          {isLoggedIn ? (
            <>
              <Link to="/my-bookings" className="hidden text-sm font-medium text-text-secondary transition hover:text-resort-700 dark:text-dark-text-secondary dark:hover:text-resort-300 sm:inline-flex">
                My stays
              </Link>
              <div ref={accountMenuRef} className="relative hidden sm:block">
                <button
                  type="button"
                  onClick={() => setAccountOpen((open) => !open)}
                  className="site-icon-button"
                  aria-label="Account menu"
                  aria-haspopup="menu"
                  aria-expanded={accountOpen}
                  aria-controls={accountOpen ? 'account-menu' : undefined}
                  title="Account options"
                >
                  <svg viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
                    <circle cx="5" cy="12" r="1.7" />
                    <circle cx="12" cy="12" r="1.7" />
                    <circle cx="19" cy="12" r="1.7" />
                  </svg>
                </button>
                {accountOpen ? (
                  <div id="account-menu" role="menu" aria-label="Account options" className="site-account-menu">
                    <Link to="/profile" role="menuitem" className="site-account-menu-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <circle cx="12" cy="8" r="3.3" strokeWidth="1.6" />
                        <path d="M5.5 20a6.5 6.5 0 0 1 13 0" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      My profile
                    </Link>
                    <Link to="/my-bookings" role="menuitem" className="site-account-menu-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <rect x="4" y="5.5" width="16" height="15" rx="2" strokeWidth="1.6" />
                        <path d="M8 3.5v4m8-4v4M4 10h16" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      My bookings
                    </Link>
                    <Link to="/checkout" role="menuitem" className="site-account-menu-link">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <rect x="3.5" y="5.5" width="17" height="13" rx="2" strokeWidth="1.6" />
                        <path d="M3.5 10h17M7 14.5h3" strokeWidth="1.6" strokeLinecap="round" />
                      </svg>
                      Checkout
                    </Link>
                    <div className="site-account-menu-divider" />
                    <button type="button" role="menuitem" onClick={handleSignOut} className="site-account-menu-link site-account-menu-signout">
                      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                        <path d="M10 5H5.5A1.5 1.5 0 0 0 4 6.5v11A1.5 1.5 0 0 0 5.5 19H10m4-3 4-4-4-4m4 4H9" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                      Sign out
                    </button>
                  </div>
                ) : null}
              </div>
            </>
          ) : (
            <Link to="/auth" className="hidden text-sm font-medium text-text-secondary transition hover:text-resort-700 dark:text-dark-text-secondary dark:hover:text-resort-300 sm:inline-flex">
              Sign in
            </Link>
          )}

          <Link to="/#booking" className="site-header-cta">
            <span className="hidden sm:inline">Book your stay</span>
            <span className="sm:hidden">Book</span>
            <svg viewBox="0 0 20 20" fill="none" aria-hidden="true">
              <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </Link>

          <button
            type="button"
            onClick={() => setMobileOpen((open) => !open)}
            className="site-icon-button xl:hidden"
            aria-label={mobileOpen ? 'Close navigation menu' : 'Open navigation menu'}
            aria-expanded={mobileOpen}
            aria-controls={mobileOpen ? 'mobile-navigation' : undefined}
          >
            {mobileOpen ? (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeWidth="1.7" d="m6 6 12 12M18 6 6 18" />
              </svg>
            ) : (
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeWidth="1.7" d="M4 7h16M4 12h16M4 17h16" />
              </svg>
            )}
          </button>
        </div>
      </div>

      {mobileOpen ? (
        <div id="mobile-navigation" className="site-mobile-panel xl:hidden">
          <nav aria-label="Mobile navigation">{renderNavLinks(true)}</nav>
          <div className="grid grid-cols-2 gap-3 pt-5">
            {isLoggedIn ? (
              <>
                <Link to="/my-bookings" onClick={() => setMobileOpen(false)} className="btn-secondary">My stays</Link>
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="btn-secondary">My profile</Link>
                <button type="button" onClick={handleSignOut} className="btn-ghost col-span-2">Sign out</button>
              </>
            ) : (
              <Link to="/auth" onClick={() => setMobileOpen(false)} className="btn-secondary col-span-2">Guest sign in</Link>
            )}
          </div>
        </div>
      ) : null}
    </header>
  );
}
