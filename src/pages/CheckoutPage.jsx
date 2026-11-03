import { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { processPayment, verifyPayment } from '../services/api';

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');
  const urlBookingRef = searchParams.get('bookingRef');

  const [form, setForm] = useState({
    bookingId: urlBookingId || 'demo-booking-id',
    amount: '420',
    method: 'gcash',
    customerEmail: 'guest@example.com',
  });
  const [status, setStatus] = useState({ type: '', message: '' });
  const [payment, setPayment] = useState(null);
  const [bookingDetails, setBookingDetails] = useState(null);
  const isLoggedIn = Boolean(localStorage.getItem('azureCoveToken'));

  useEffect(() => {
    if (urlBookingId) {
      // In a real app, you'd fetch booking details from the API
      // For now, we'll use the URL params to show basic info
      setBookingDetails({
        id: urlBookingId,
        reference: urlBookingRef,
      });
    }
  }, [urlBookingId, urlBookingRef]);

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
    <div className="min-h-screen bg-surface px-4 py-12 text-text-primary">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card-surface-elevated p-8">
          <span className="badge badge-info">Payment gateway</span>
          <h1 className="mt-6 text-heading-xl">Secure payment intake</h1>
          <p className="mt-4 text-body-lg text-text-secondary">
            This booking flow supports GCash, QR PH, and cash payments while live payment gateways are deferred.
          </p>

          <div className="mt-8 space-y-3 card-surface p-4">
            <p className="text-body-sm"><span className="font-medium text-text-primary">Supported methods:</span> GCash, QR PH, Cash</p>
            <p className="text-body-sm"><span className="font-medium text-text-primary">Status:</span> local booking confirmation flow only</p>
            <p className="text-body-sm"><span className="font-medium text-text-primary">Security:</span> no card data or sensitive payment tokens stored</p>
          </div>

          {bookingDetails && (
            <div className="mt-8 space-y-2 card-surface p-4 border-l-4 border-state-success bg-state-success/5">
              <h3 className="font-semibold text-state-success">Booking Summary</h3>
              <p className="text-body-sm">Ref: <span className="font-mono text-text-primary">{bookingDetails.reference || bookingDetails.id}</span></p>
              <p className="text-body-sm">Booking ID: <span className="font-mono text-text-primary">{bookingDetails.id}</span></p>
              <p className="text-body-sm">Amount: <span className="font-semibold text-text-primary">${form.amount}</span></p>
            </div>
          )}
        </div>

        <form onSubmit={handleSubmit} className="card-surface-elevated p-8">
          <h2 className="text-heading-md">Payment details</h2>

          <div className="mt-6 space-y-5">
            <div className="form-group">
              <label className="form-label" htmlFor="bookingId">Booking ID</label>
              <input
                type="text"
                id="bookingId"
                name="bookingId"
                value={form.bookingId}
                onChange={handleChange}
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount</label>
              <input
                type="number"
                id="amount"
                name="amount"
                value={form.amount}
                onChange={handleChange}
                className="form-input"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="method">Payment method</label>
              <select
                id="method"
                name="method"
                value={form.method}
                onChange={handleChange}
                className="form-select"
              >
                <option value="gcash">GCash</option>
                <option value="qr_ph">QR PH</option>
                <option value="cash">Cash</option>
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerEmail">Customer email</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={form.customerEmail}
                onChange={handleChange}
                className="form-input"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isLoggedIn ? (
              <Link
                to="/auth"
                className="btn-primary flex-1 text-center"
              >
                Login to continue booking
              </Link>
            ) : (
              <button
                type="submit"
                className="btn-primary flex-1"
              >
                Process payment
              </button>
            )}
            {payment && (
              <button
                type="button"
                onClick={handleVerify}
                className="btn-outline flex-1"
              >
                Verify payment
              </button>
            )}
          </div>

          {status.message && (
            <p className={`mt-4 text-body-sm ${status.type === 'error' ? 'text-state-error' : status.type === 'success' ? 'text-state-success' : 'text-text-muted'}`}>
              {status.message}
            </p>
          )}
        </form>
      </div>
    </div>
  );
}
