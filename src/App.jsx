import { BrowserRouter, Link, Route, Routes, useLocation } from 'react-router-dom';
import Header from './components/Header';
import ChatWidget from './components/ChatWidget';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/checkout" element={<CheckoutPage />} />
        <Route path="/reports" element={<ReportsPage />} />
        <Route path="/admin" element={<AdminLoginPage />} />
        <Route path="/admin/login" element={<AdminLoginPage />} />
        <Route path="/admin/dashboard" element={<AdminDashboardPage view="dashboard" />} />
        <Route path="/admin/staff" element={<AdminDashboardPage view="staff" />} />
        <Route path="/admin/roles" element={<AdminDashboardPage view="roles" />} />
        <Route path="/admin/permissions" element={<AdminDashboardPage view="permissions" />} />
        <Route path="/admin/bookings" element={<AdminDashboardPage view="bookings" />} />
        <Route path="/admin/rooms" element={<AdminDashboardPage view="rooms" />} />
        <Route path="/admin/inquiries" element={<AdminDashboardPage view="inquiries" />} />
        <Route path="/admin/chat" element={<AdminDashboardPage view="chat" />} />
        <Route path="/admin/reports" element={<AdminDashboardPage view="reports" />} />
        <Route path="/admin/settings" element={<AdminDashboardPage view="settings" />} />
        <Route path="/admin/profile" element={<AdminDashboardPage view="profile" />} />
      </Routes>
      {!isAdminRoute && (
        <>
          <ChatWidget />
          <footer className="border-t border-white/10 bg-slate-950 py-4 text-center text-sm text-slate-400">
            <div className="section-shell flex flex-col items-center justify-between gap-3 md:flex-row">
              <p>Azure Cove Resort</p>
              <div className="flex items-center gap-4">
                <Link to="/" className="hover:text-white">Home</Link>
                <Link to="/auth" className="hover:text-white">Login</Link>
                <Link to="/checkout" className="hover:text-white">Checkout</Link>
                <Link to="/reports" className="hover:text-white">Reports</Link>
              </div>
            </div>
          </footer>
        </>
      )}
    </>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      <AppShell />
    </BrowserRouter>
  );
}
