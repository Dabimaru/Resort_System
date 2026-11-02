import { useState } from 'react';
import { Link } from 'react-router-dom';
import { processPayment, verifyPayment } from '../services/api';

export default function CheckoutPage() {
  const [form, setForm] = useState({
    bookingId: 'demo-booking-id',
    amount: '420',
    method: 'gcash',
    customerEmail: 'guest@example.com',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [payment, setPayment] = useState(null);
  const isLoggedIn = Boolean(localStorage.getItem('azureCoveToken'));

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      setStatus({ type: 'error', message: 'Please sign in to continue with your booking.' });
      return;
    }

    setStatus({ type: 'loading', message: 'Processing secure payment...' });

    try {
      const response = await processPayment(form);
      setPayment(response.payment);
      setStatus({
        type: 'success',
        message: `Payment initiated. Reference: ${response.payment.paymentReference}. Verification code: ${response.payment.verificationCode}`,
      });
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Payment failed.' });
    }
  };

  const handleVerify = async () => {
    if (!payment) return;

    try {
      const response = await verifyPayment({ paymentId: payment.id, verificationCode: payment.verificationCode });
      setStatus({ type: 'success', message: `Verified and captured: ${response.payment.paymentReference}` });
      setPayment(response.payment);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Verification failed.' });
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-resort-200">
            Payment gateway
          </span>
          <h1 className="mt-6 text-4xl font-semibold">Secure payment intake</h1>
          <p className="mt-4 text-slate-300">
            This booking flow supports GCash, QR PH, and cash payments while live payment gateways are deferred.
          </p>

          <div className="mt-8 space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 text-sm text-slate-300">
            <p><span className="font-medium text-white">Supported methods:</span> GCash, QR PH, Cash</p>
            <p><span className="font-medium text-white">Status:</span> local booking confirmation flow only</p>
            <p><span className="font-medium text-white">Security:</span> no card data or sensitive payment tokens stored</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-3xl border border-white/10 bg-slate-900/80 p-8">
          <h2 className="text-2xl font-semibold">Payment details</h2>

          <div className="mt-6 space-y-5">
            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Booking ID</span>
              <input
                type="text"
                name="bookingId"
                value={form.bookingId}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Amount</span>
              <input
                type="number"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>

            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Payment method</span>
              <select
                name="method"
                value={form.method}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              >
                <option value="gcash">GCash</option>
                <option value="qr_ph">QR PH</option>
                <option value="cash">Cash</option>
              </select>
            </label>

            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Customer email</span>
              <input
                type="email"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-4 py-3 text-white"
              />
            </label>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="flex-1 rounded-full bg-resort-500 px-5 py-3 text-center text-sm font-semibold text-slate-950 transition hover:bg-resort-400"
              >
                Login to continue booking
              </Link>
            ) : (
              <button
                type="submit"
                className="flex-1 rounded-full bg-resort-500 px-5 py-3 text-sm font-semibold text-slate-950 transition hover:bg-resort-400"
              >
                Process payment
              </button>
            )}
            {payment && (
              <button
                type="button"
                onClick={handleVerify}
                className="flex-1 rounded-full border border-white/15 px-5 py-3 text-sm text-slate-200 transition hover:border-white/40 hover:text-white"
              >
                Verify payment
              </button>
            )}
          </div>

          {status.message && (
            <p
              className={`mt-4 text-sm ${
                status.type === 'error' ? 'text-red-300' : status.type === 'success' ? 'text-emerald-300' : 'text-slate-300'
              }`}
            >
              {status.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
