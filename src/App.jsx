import { BrowserRouter, Navigate, Route, Routes, useLocation } from 'react-router-dom';
import { ThemeProvider } from './context/ThemeContext';
import Header from './components/Header';
import Footer from './components/Footer';
import ChatWidget from './components/ChatWidget';
import AdminDashboardPage from './pages/AdminDashboardPage';
import AdminLoginPage from './pages/AdminLoginPage';
import AuthPage from './pages/AuthPage';
import CheckoutPage from './pages/CheckoutPage';
import HomePage from './pages/HomePage';
import ReportsPage from './pages/ReportsPage';
import MyBookingsPage from './pages/MyBookingsPage';
import ProfilePage from './pages/ProfilePage';
import TermsPage from './pages/TermsPage';
import HouseRulesPage from './pages/HouseRulesPage';
import PrivacyPage from './pages/PrivacyPage';

function RequireAuth({ children }) {
  const token = localStorage.getItem('azureCoveToken');
  return token ? children : <Navigate to="/auth" replace />;
}

function AppShell() {
  const location = useLocation();
  const isAdminRoute = location.pathname.startsWith('/admin');

  return (
    <>
      {!isAdminRoute && <Header />}
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<AuthPage />} />
        <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
        <Route path="/my-bookings" element={<RequireAuth><MyBookingsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
        <Route path="/terms" element={<TermsPage />} />
        <Route path="/house-rules" element={<HouseRulesPage />} />
        <Route path="/privacy" element={<PrivacyPage />} />
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
        <Route path="*" element={<HomePage />} />
      </Routes>
      {!isAdminRoute && (
        <>
          <ChatWidget />
          <Footer />
        </>
      )}
    </>
  );
}

export default function App() {
  const rawBase = import.meta.env.VITE_BASE_PATH || import.meta.env.BASE_URL || '/';
  const basename = rawBase.replace(/\/+$/, '') || '/';

  return (
    <ThemeProvider>
      <BrowserRouter basename={basename}>
        <AppShell />
      </BrowserRouter>
    </ThemeProvider>
  );
}