import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getUserBookings } from '../services/api';

export default function MyBookingsPage() {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const loadBookings = async () => {
      const token = localStorage.getItem('azureCoveToken');
      if (!token) {
        setLoading(false);
        return;
      }

      try {
        const response = await getUserBookings(token);
        setBookings(response?.bookings || []);
      } catch (err) {
        setError(err.message || 'Unable to load bookings.');
      } finally {
        setLoading(false);
      }
    };

    loadBookings();
  }, []);

  const formatDate = (dateStr) => {
    return new Date(dateStr).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric',
    });
  };

  const getStatusBadge = (status) => {
    switch (status) {
      case 'confirmed':
        return 'badge badge-success';
      case 'pending':
        return 'badge badge-warning';
      case 'cancelled':
        return 'badge badge-error';
      default:
        return 'badge badge-neutral';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-center text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell">Loading your bookings...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell card-surface-elevated p-8 border-l-4 border-state-error">
          <h1 className="text-heading-xl">Unable to load bookings</h1>
          <p className="mt-3 text-state-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="section-shell space-y-8">
        <div>
          <span className="badge badge-info">Your reservations</span>
          <h1 className="mt-4 text-heading-xl">My Bookings</h1>
        </div>

        {bookings.length === 0 ? (
          <div className="card-surface-elevated p-12 text-center">
            <p className="text-text-secondary text-lg dark:text-dark-text-secondary">You don't have any bookings yet.</p>
            <p className="mt-2 text-text-muted dark:text-dark-text-muted">Start planning your getaway!</p>
            <Link
              to="/"
              className="mt-6 btn-primary"
            >
              Browse Suites
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {bookings.map((booking) => (
              <div
                key={booking.id}
                className="card-interactive p-6"
              >
                <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
                  <div className="flex items-center gap-4">
                    <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-resort-500/20 text-2xl font-semibold text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">
                      {booking.suite?.charAt(0) || 'R'}
                    </div>
                    <div>
                      <h3 className="text-heading-md font-semibold text-text-primary dark:text-dark-text-primary">{booking.suite}</h3>
                      <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">
                        {booking.guests} guest{booking.guests > 1 ? 's' : ''} •{' '}
                        {formatDate(booking.arrival)} - {formatDate(booking.departure)}
                      </p>
                      <p className="text-body-sm text-text-muted mt-1 dark:text-dark-text-muted">
                        Ref: {booking.bookingReference || booking.id}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-4">
                    <span className={getStatusBadge(booking.status)}>
                      {booking.status}
                    </span>
                    <Link
                      to={`/checkout?bookingId=${booking.id}`}
                      className="btn-primary btn-sm"
                    >
                      {booking.status === 'confirmed' ? 'View Details' : 'Complete Payment'}
                    </Link>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}