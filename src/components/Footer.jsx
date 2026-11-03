import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950 py-8 text-sm text-slate-400">
      <div className="section-shell flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <p className="font-semibold text-white">Azure Cove Resort</p>
          <p className="mt-1 text-xs text-slate-400">© 2026 Azure Cove Resort. All rights reserved.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-6">
          <Link to="/" className="transition hover:text-white">Home</Link>
          <Link to="/auth" className="transition hover:text-white">Guest login</Link>
          <Link to="/checkout" className="transition hover:text-white">Checkout</Link>
          <Link to="/reports" className="transition hover:text-white">Reports</Link>
          <Link to="/admin" className="transition hover:text-white">Admin portal</Link>
        </nav>

        <div className="flex items-center gap-5 text-xs text-slate-400">
          <a href="#stay" className="transition hover:text-white">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
