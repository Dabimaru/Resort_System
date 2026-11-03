import { Link } from 'react-router-dom';

export default function Footer() {
  return (
    <footer className="border-t border-border bg-surface py-8 text-body-sm text-text-muted">
      <div className="section-shell flex flex-col items-center justify-between gap-6 md:flex-row">
        <div>
          <p className="font-semibold text-text-primary">Azure Cove Resort</p>
          <p className="mt-1 text-caption">© 2026 Azure Cove Resort. All rights reserved.</p>
        </div>

        <nav className="flex flex-wrap items-center gap-6">
          <Link to="/" className="text-link">Home</Link>
          <Link to="/auth" className="text-link">Guest login</Link>
          <Link to="/checkout" className="text-link">Checkout</Link>
          <Link to="/reports" className="text-link">Reports</Link>
          <Link to="/admin" className="text-link">Admin portal</Link>
        </nav>

        <div className="flex items-center gap-5 text-caption">
          <a href="#stay" className="text-link">Back to top ↑</a>
        </div>
      </div>
    </footer>
  );
}
