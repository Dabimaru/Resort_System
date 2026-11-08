import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

const exploreLinks = [
  ['The resort', '/#stay'],
  ['Suites', '/#suites'],
  ['Experiences', '/#experiences'],
  ['Gallery', '/#gallery'],
  ['Guest stories', '/#reviews'],
];

const guestLinks = [
  ['Check availability', '/#booking'],
  ['My bookings', '/my-bookings'],
  ['Terms and conditions', '/terms'],
  ['House rules', '/house-rules'],
  ['Privacy notice', '/privacy'],
];

export default function Footer() {
  const handleChatSupport = (event) => {
    const launcher = document.getElementById('azure-cove-chat-launcher');
    if (launcher) {
      event.preventDefault();
      launcher.click();
    }
  };

  return (
    <footer className="bg-[#142b25] text-white">
      <div className="section-shell py-14 md:py-16">
        <div className="grid gap-12 border-b border-white/15 pb-12 md:grid-cols-[1.4fr_0.7fr_0.8fr_1fr] md:gap-10">
          <div className="max-w-sm">
            <Link to="/" className="inline-flex items-center gap-3" aria-label={`${resortData.company} home`}>
              <span className="flex h-10 w-10 items-center justify-center rounded-full border border-white/30 text-[#e1c49b]" aria-hidden="true">
                <svg viewBox="0 0 40 40" fill="none" className="h-7 w-7">
                  <path d="M5 24.5c4.2 0 4.2-4 8.4-4s4.2 4 8.4 4 4.2-4 8.4-4 4.2 4 8.4 4M5 31c4.2 0 4.2-4 8.4-4s4.2 4 8.4 4 4.2-4 8.4-4 4.2 4 8.4 4M20 5.5v11m-5.5-5.5H25.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                </svg>
              </span>
              <span>
                <span className="block font-display text-2xl font-semibold leading-none">{resortData.company}</span>
                <span className="mt-1 block text-[0.62rem] uppercase tracking-[0.2em] text-white/55">A coastal sanctuary</span>
              </span>
            </Link>
            <p className="mt-5 text-sm leading-6 text-white/65">{resortData.tagline}</p>
            <a href={`mailto:${resortData.contact.email}`} className="mt-5 inline-block text-sm text-[#e1c49b] transition hover:text-white">
              {resortData.contact.email}
            </a>
          </div>

          <FooterLinks title="Explore" links={exploreLinks} />
          <FooterLinks title="Guest information" links={guestLinks} />

          <div>
            <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">Get in touch</h2>
            <address className="mt-5 space-y-3 not-italic text-sm leading-6 text-white/75">
              <p>{resortData.contact.address}</p>
              <a href={`tel:${resortData.contact.phone.replace(/\D/g, '')}`} className="block transition hover:text-white">{resortData.contact.phone}</a>
              <a href={`mailto:${resortData.contact.email}`} className="block transition hover:text-white">{resortData.contact.email}</a>
            </address>
            <Link to="/#contact" className="mt-5 inline-flex items-center gap-2 text-sm font-medium text-[#e1c49b] hover:text-white">
              Contact our team <span aria-hidden="true">→</span>
            </Link>
            <a href="#chat" onClick={handleChatSupport} className="mt-3 block text-sm text-white/65 transition hover:text-white">
              Chat with the concierge
            </a>
          </div>
        </div>

        <div className="flex flex-col gap-3 pt-6 text-xs text-white/50 sm:flex-row sm:items-center sm:justify-between">
          <p>© {new Date().getFullYear()} {resortData.company}. All rights reserved.</p>
          <p>Made for moments that matter.</p>
        </div>
      </div>
    </footer>
  );
}

function FooterLinks({ title, links }) {
  return (
    <nav aria-label={title}>
      <h2 className="text-xs font-semibold uppercase tracking-[0.18em] text-white/55">{title}</h2>
      <ul className="mt-5 space-y-3">
        {links.map(([label, to]) => (
          <li key={label}>
            <Link to={to} className="text-sm text-white/75 transition hover:text-white">{label}</Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
