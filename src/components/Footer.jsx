import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

export default function Footer() {
  const address = resortData.contact?.address || '17 Shoreline Point, Riviera Bay, CA';
  const phone = resortData.contact?.phone || '+1 (800) 555-0148';
  const email = resortData.contact?.email || 'stay@azurecove.com';

  const supportItems = [
    { label: 'My Bookings', to: '/my-bookings' },
    { label: 'Checkout', to: '/checkout' },
    { label: phone, href: `tel:${phone.replace(/\D/g, '')}` },
    { label: email, href: `mailto:${email}` },
    { label: 'Chat Support', to: '#chat' },
    { label: 'Inquiries', to: '/contact' },
  ];

  const exploreItems = [
    { label: 'Stay', to: '#stay' },
    { label: 'Suites', to: '#suites' },
    { label: 'Experience', to: '#experiences' },
    { label: 'Gallery', to: '#gallery' },
    { label: 'Reviews', to: '#reviews' },
  ];

  const socialItems = [
    { label: 'Facebook', href: 'https://facebook.com', icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
    )},
    { label: 'Instagram', href: 'https://instagram.com', icon: (
      <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
    )},
    { label: 'TikTok', href: 'https://tiktok.com', icon: (
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24"><path d="M22 6.8c-.3 1.3-.8 2.6-1.5 3.9 1.9-.4 3.4-1.5 4.1-3.2-.1 2.6-1.5 4.9-3.9 5.6 0 0 .2 2.8-.4 4.2 1.5.4 3 1 4.6 2 1.1 0 2.2-.1 3.2-.4.8-2-.2-4.1-.8-5.9.9 2.3 1.6 4.7 2 7.3-.6-2.6-.8-5.2-.7-7.9-.5 2-.8 4-1.5 5.8-1.1 0-2.2-.2-3.3-.5 1-2.4.2-4.8-.7-7.1-1.6 1-.9 2.3-2.1 3.7-3.4-.3-1.6-.7-3.2-1.4-4.7 1.9.5 3.5 1.6 4.5 3.1-.2-2.8-1.2-5.4-3.4-7.1 2.7.9 5 2.5 6.7 4.6-.5-2.5-1.4-4.9-3-6.8z"/></svg>
    )},
  ];

  const policyItems = [
    { label: 'Terms and Conditions', to: '/terms' },
    { label: 'House Rules', to: '/house-rules' },
    { label: 'Privacy Notice', to: '/privacy' },
  ];

  return (
    <footer className="border-t border-border bg-surface dark:border-dark-border dark:bg-dark-surface">
      <div className="section-shell py-12 lg:py-16">
        {/* Main Content Grid */}
        <div className="grid gap-8 md:grid-cols-5 lg:grid-cols-[1.5fr_1fr_1fr_1fr_1fr]">
          {/* Left Section: Support */}
          <div className="space-y-4">
            <h3 className="text-heading-sm font-semibold text-text-primary dark:text-dark-text-primary">Support</h3>
            <nav className="space-y-3">
              {supportItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href || item.to}
                  className="flex items-center gap-2 text-body-sm text-text-secondary transition hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                >
                  {item.href ? (
                    <svg className="h-4 w-4 text-text-muted dark:text-dark-text-muted" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 15l-2 5L9 9l11 4-5 2zm0 0l5 5M7.188 2.239l.777 2.897M5.136 7.965l-2.898-.777M13.95 4.05l-2.122 2.122m-5.657 5.656l-2.12 2.122" />
                    </svg>
                  ) : null}
                  {item.label}
                </a>
              ))}
            </nav>
          </div>

          {/* Center-Left Section: Explore */}
          <div className="space-y-4">
            <h3 className="text-heading-sm font-semibold text-text-primary dark:text-dark-text-primary">Explore</h3>
            <nav className="space-y-3">
              {exploreItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-body-sm text-text-secondary transition hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>

          {/* Center Section: Resort Brand */}
          <div className="flex flex-col items-center text-center space-y-6">
            <div className="flex flex-col items-center gap-3">
              <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-resort-500/10 dark:bg-resort-500/20">
                <svg className="h-10 w-10 text-resort-600 dark:text-resort-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
              </div>
              <div>
                <p className="text-heading-lg font-semibold text-text-primary dark:text-dark-text-primary">{resortData.company}</p>
                <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">A coastal sanctuary</p>
              </div>
            </div>

            <address className="not-italic text-body-sm text-text-secondary dark:text-dark-text-secondary space-y-1">
              <p>{address}</p>
              <a href="https://maps.google.com" target="_blank" rel="noopener noreferrer" className="text-link inline-flex items-center gap-1">
                <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 18.657A8 8 0 016.343 7.343S7 9 9 10c0-2 .5-5 2.986-7C14 5 16.09 5.777 17.656 7.343A7.975 7.975 0 0120 13a7.975 7.975 0 01-2.343 5.657z" />
                </svg>
                Find Us on Google Maps
              </a>
            </address>
          </div>

          {/* Center-Right Section: Social */}
          <div className="space-y-4">
            <h3 className="text-heading-sm font-semibold text-text-primary dark:text-dark-text-primary">Social</h3>
            <div className="flex flex-wrap gap-3">
              {socialItems.map((item) => (
                <a
                  key={item.label}
                  href={item.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center justify-center h-10 w-10 rounded-xl border border-border bg-surface-elevated text-text-secondary transition hover:border-resort-500 hover:text-resort-600 hover:bg-resort-500/10 dark:border-dark-border dark:bg-dark-surface-elevated dark:text-dark-text-secondary dark:hover:border-resort-400 dark:hover:text-resort-400 dark:hover:bg-resort-500/20"
                  aria-label={item.label}
                >
                  {item.icon}
                </a>
              ))}
            </div>
          </div>

          {/* Right Section: Policies */}
          <div className="space-y-4">
            <h3 className="text-heading-sm font-semibold text-text-primary dark:text-dark-text-primary">Policies</h3>
            <nav className="space-y-3">
              {policyItems.map((item) => (
                <Link
                  key={item.label}
                  to={item.to}
                  className="text-body-sm text-text-secondary transition hover:text-text-primary dark:text-dark-text-secondary dark:hover:text-dark-text-primary"
                >
                  {item.label}
                </Link>
              ))}
            </nav>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-border dark:border-dark-border">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <p className="text-body-sm font-semibold text-text-primary dark:text-dark-text-primary">
              {resortData.company}
            </p>
            <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">
              © {new Date().getFullYear()} {resortData.company}. All rights reserved.
            </p>
            <div className="flex items-center gap-6 text-body-sm text-text-secondary dark:text-dark-text-secondary">
              <Link to="/terms" className="hover:text-text-primary dark:hover:text-dark-text-primary transition">Terms</Link>
              <Link to="/privacy" className="hover:text-text-primary dark:hover:text-dark-text-primary transition">Privacy</Link>
              <Link to="/house-rules" className="hover:text-text-primary dark:hover:text-dark-text-primary transition">House Rules</Link>
            </div>
          </div>
        </div>
      </div>
    </footer>
  );
}