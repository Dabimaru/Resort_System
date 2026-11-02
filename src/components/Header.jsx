import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

const navItems = [
  { label: 'Stay', target: 'stay' },
  { label: 'Suites', target: 'suites' },
  { label: 'Experiences', target: 'experiences' },
  { label: 'Dining', target: 'dining' },
  { label: 'Wellness', target: 'wellness' },
];

export default function Header() {
  return (
    <header className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/80 backdrop-blur-xl">
      <div className="section-shell flex items-center justify-between py-4">
        <Link to="/" className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-resort-500/20 text-lg font-semibold text-resort-200">
            A
          </div>
          <div>
            <p className="text-lg font-semibold text-white">{resortData.company}</p>
          </div>
        </Link>

        <nav className="hidden items-center gap-8 md:flex">
          {navItems.map((item) => (
            <a
              key={item.label}
              href={`/#${item.target}`}
              className="text-sm text-slate-200 transition hover:text-white"
            >
              {item.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-3">
          <Link
            to="/checkout"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/35 hover:text-white"
          >
            Checkout
          </Link>
          <Link
            to="/auth"
            className="rounded-full border border-white/15 px-4 py-2 text-sm text-slate-200 transition hover:border-white/35 hover:text-white"
          >
            Guest login
          </Link>
        </div>
      </div>
    </header>
  );
}
