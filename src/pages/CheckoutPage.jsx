import { useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  getBooking,
  getUserBookings,
  processPayment,
  verifyPayment,
} from '../services/api';

const DOWNPAYMENT_RATE = 0.5;

const paymentMethods = [
  { value: 'gcash', label: 'GCash' },
  { value: 'qr_ph', label: 'QR PH' },
  { value: 'cash', label: 'Cash' },
];

const paymentTypes = [
  { value: 'downpayment', label: 'Downpayment (50%)' },
  { value: 'full', label: 'Full payment (100%)' },
];

const currency = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function CheckoutPage() {
  const [searchParams] = useSearchParams();
  const urlBookingId = searchParams.get('bookingId');

  const [booking, setBooking] = useState(null);
  const [loading, setLoading] = useState(Boolean(urlBookingId));
  const [status, setStatus] = useState({ type: '', message: '' });
  const [payment, setPayment] = useState(null);
  const [processing, setProcessing] = useState(false);
  const [form, setForm] = useState({
    bookingId: urlBookingId || '',
    method: 'gcash',
    paymentType: 'downpayment',
    customerEmail: '',
  });

  const token = typeof window === 'undefined' ? null : localStorage.getItem('azureCoveToken');
  const isLoggedIn = Boolean(token);

  useEffect(() => {
    if (!urlBookingId) {
      setLoading(false);
      return;
    }

    let cancelled = false;

    const load = async () => {
      try {
        const response = await getBooking(urlBookingId, token);
        if (cancelled) return;

        const found = response?.booking || null;
        setBooking(found);
        setForm((current) => ({
          ...current,
          bookingId: found?.id || urlBookingId,
          customerEmail: found?.guestEmail || current.customerEmail,
        }));
      } catch (error) {
        if (cancelled) return;

        // Fall back to the guest's own reservation list if the direct lookup fails.
        try {
          const fallback = await getUserBookings(token);
          const found = (fallback?.bookings || []).find((entry) => entry.id === urlBookingId);
          if (found && !cancelled) {
            setBooking(found);
            setForm((current) => ({
              ...current,
              bookingId: found.id,
              customerEmail: found.guestEmail || current.customerEmail,
            }));
            return;
          }
        } catch (fallbackError) {
          // Ignore and surface the original error below.
        }

        if (!cancelled) {
          setStatus({ type: 'error', message: error.message || 'Unable to load this reservation.' });
        }
      } finally {
        if (!cancelled) {
          setLoading(false);
        }
      }
    };

    load();

    return () => {
      cancelled = true;
    };
  }, [urlBookingId, token]);

  const totalAmount = Number(booking?.totalAmount || 0);
  const amountPaid = Number(booking?.amountPaid || 0);
  const balance = Math.max(0, totalAmount - amountPaid);

  const amountDue = useMemo(() => {
    if (form.paymentType === 'full') {
      return balance || totalAmount;
    }

    return Math.round(totalAmount * DOWNPAYMENT_RATE * 100) / 100;
  }, [form.paymentType, totalAmount, balance]);

  const awaitingConfirmation = booking?.status === 'pending';
  const alreadySettled = booking?.status === 'approved';

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!isLoggedIn) {
      setStatus({ type: 'error', message: 'Please sign in to continue with your payment.' });
      return;
    }

    if (!form.bookingId) {
      setStatus({ type: 'error', message: 'A reservation reference is required before payment.' });
      return;
    }

    setProcessing(true);
    setStatus({ type: 'loading', message: 'Processing secure payment...' });

    try {
      const initiated = await processPayment({
        bookingId: form.bookingId,
        amount: amountDue,
        method: form.method,
        paymentType: form.paymentType,
        customerEmail: form.customerEmail,
      });

      const settled = await verifyPayment({
        paymentId: initiated.payment.id,
        verificationCode: initiated.payment.verificationCode,
      });

      setPayment(settled.payment);
      setStatus({
        type: 'success',
        message: `Payment successful. Reference: ${settled.payment.paymentReference}`,
      });

      const refreshed = await getBooking(form.bookingId, token).catch(() => null);
      if (refreshed?.booking) {
        setBooking(refreshed.booking);
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Payment failed.' });
    } finally {
      setProcessing(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-center text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell">Loading your reservation...</div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="section-shell grid gap-8 lg:grid-cols-[0.9fr_1.1fr]">
        <div className="card-surface-elevated p-8">
          <span className="badge badge-primary">Payment gateway</span>
          <h1 className="mt-6 text-heading-xl">Settle your reservation</h1>
          <p className="mt-4 text-body-lg text-text-secondary dark:text-dark-text-secondary">
            Pay half now to hold your dates, or settle the full amount up front. GCash, QR PH, and cash are all accepted.
          </p>

          <div className="mt-8 space-y-3 card-surface p-4">
            <p className="text-body-sm"><span className="font-medium text-text-primary dark:text-dark-text-primary">Supported methods:</span> GCash, QR PH, Cash</p>
            <p className="text-body-sm"><span className="font-medium text-text-primary dark:text-dark-text-primary">Downpayment:</span> 50% of the reservation total</p>
            <p className="text-body-sm"><span className="font-medium text-text-primary dark:text-dark-text-primary">Security:</span> no card data or sensitive payment tokens are stored</p>
          </div>

          {booking ? (
            <div className="mt-8 space-y-2 card-surface p-4 border-l-4 border-state-success bg-state-success/5 dark:bg-state-success/10">
              <h3 className="font-semibold text-state-success">Booking summary</h3>
              <p className="text-body-sm">
                Reference <span className="font-mono text-text-primary dark:text-dark-text-primary">{booking.bookingReference || booking.id}</span>
              </p>
              <p className="text-body-sm">
                {(booking.rooms || []).map((room) => room.name).join(' + ') || booking.suite}
              </p>
              <p className="text-body-sm">
                {formatDate(booking.arrival)} → {formatDate(booking.departure)}
              </p>
              <p className="text-body-sm">
                {booking.adults} adult{booking.adults === 1 ? '' : 's'}
                {booking.children ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}` : ''}
              </p>
              <p className="text-body-sm">
                Total <span className="font-semibold text-text-primary dark:text-dark-text-primary">{currency(totalAmount)}</span>
                {amountPaid > 0 ? ` · Paid ${currency(amountPaid)} · Balance ${currency(balance)}` : ''}
              </p>
            </div>
          ) : null}

          {payment ? (
            <div className="mt-6 space-y-2 card-surface p-4 border-l-4 border-state-info">
              <h3 className="font-semibold text-state-info">Payment reference</h3>
              <p className="font-mono text-body-md text-text-primary dark:text-dark-text-primary">{payment.paymentReference}</p>
              <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">
                {payment.paymentType === 'full' ? 'Full payment' : 'Downpayment'} · {currency(payment.amount)} · {payment.method}
              </p>
            </div>
          ) : null}
        </div>

        <form onSubmit={handleSubmit} className="card-surface-elevated p-8">
          <h2 className="text-heading-md">Payment details</h2>

          {!urlBookingId ? (
            <div className="mt-6 rounded-2xl border border-state-warning/30 bg-state-warning/10 p-4 text-body-sm text-state-warning">
              Choose a reservation from <Link to="/my-bookings" className="underline">My Bookings</Link> to continue with payment.
            </div>
          ) : null}

          {awaitingConfirmation ? (
            <div className="mt-6 rounded-2xl border border-state-warning/30 bg-state-warning/10 p-4 text-body-sm text-state-warning">
              This reservation is still pending confirmation. Payment opens as soon as our team approves your stay.
            </div>
          ) : null}

          {alreadySettled && !payment ? (
            <div className="mt-6 rounded-2xl border border-state-success/30 bg-state-success/10 p-4 text-body-sm text-state-success">
              This reservation is already approved and settled.
            </div>
          ) : null}

          <div className="mt-6 space-y-5">
            <div className="form-group">
              <label className="form-label" htmlFor="bookingId">Reservation reference</label>
              <input
                type="text"
                id="bookingId"
                name="bookingId"
                value={form.bookingId}
                onChange={(event) => setForm((current) => ({ ...current, bookingId: event.target.value }))}
                className="form-input font-mono"
                placeholder="AZ-XXXXXX"
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="paymentType">Payment type</label>
              <select
                id="paymentType"
                name="paymentType"
                value={form.paymentType}
                onChange={(event) => setForm((current) => ({ ...current, paymentType: event.target.value }))}
                className="form-select"
              >
                {paymentTypes.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="amount">Amount due</label>
              <input
                type="text"
                id="amount"
                name="amount"
                value={currency(amountDue)}
                className="form-input"
                readOnly
              />
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="method">Payment method</label>
              <select
                id="method"
                name="method"
                value={form.method}
                onChange={(event) => setForm((current) => ({ ...current, method: event.target.value }))}
                className="form-select"
              >
                {paymentMethods.map((option) => (
                  <option key={option.value} value={option.value}>{option.label}</option>
                ))}
              </select>
            </div>

            <div className="form-group">
              <label className="form-label" htmlFor="customerEmail">Customer email</label>
              <input
                type="email"
                id="customerEmail"
                name="customerEmail"
                value={form.customerEmail}
                onChange={(event) => setForm((current) => ({ ...current, customerEmail: event.target.value }))}
                className="form-input"
                placeholder="you@example.com"
              />
            </div>
          </div>

          <div className="mt-6 flex flex-col gap-3 sm:flex-row">
            {!isLoggedIn ? (
              <Link to="/auth" className="btn-primary flex-1 text-center">
                Log in to continue
              </Link>
            ) : (
              <button
                type="submit"
                disabled={processing || awaitingConfirmation || alreadySettled || !form.bookingId}
                className="btn-primary flex-1"
              >
                {processing ? 'Processing...' : `Pay ${currency(amountDue)}`}
              </button>
            )}
          </div>

          {status.message ? (
            <p className={`mt-4 text-body-sm ${status.type === 'error' ? 'text-state-error' : status.type === 'success' ? 'text-state-success' : 'text-text-muted'}`}>
              {status.message}
            </p>
          ) : null}

          {payment ? (
            <Link to="/my-bookings" className="mt-4 inline-flex btn-outline">
              Back to my bookings
            </Link>
          ) : null}
        </form>
      </div>
    </div>
  );
}
