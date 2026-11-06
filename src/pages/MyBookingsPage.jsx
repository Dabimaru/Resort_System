import { useCallback, useEffect, useMemo, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import {
  fetchRooms,
  getUserBookings,
  submitBooking,
} from '../services/api';

const MAX_GUESTS = 20;
const PRESET_MAX = 10;

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

const statusMeta = {
  pending: { label: 'Pending', hint: 'Waiting for confirmation from our team.', className: 'badge badge-warning' },
  processing: { label: 'Processing', hint: 'Confirmed. Complete your payment to lock it in.', className: 'badge badge-primary' },
  approved: { label: 'Approved', hint: 'Payment received. Your stay is secured.', className: 'badge badge-success' },
  cancelled: { label: 'Cancelled', hint: 'This reservation was cancelled.', className: 'badge badge-error' },
};

const currency = (value) => `$${Number(value || 0).toLocaleString(undefined, { minimumFractionDigits: 0, maximumFractionDigits: 2 })}`;

const formatDate = (value) => {
  if (!value) return '—';
  return new Date(`${value}T00:00:00`).toLocaleDateString('en-US', { year: 'numeric', month: 'short', day: 'numeric' });
};

export default function MyBookingsPage() {
  const [searchParams] = useSearchParams();

  const [bookings, setBookings] = useState([]);
  const [rooms, setRooms] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [notice, setNotice] = useState(null);

  const [activeRoom, setActiveRoom] = useState(null);
  const [selectedRoomNames, setSelectedRoomNames] = useState([]);
  const [form, setForm] = useState({ arrival: '', departure: '', adults: '2', children: '0' });
  const [submitting, setSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState('');

  const today = new Date().toISOString().slice(0, 10);

  const loadData = useCallback(async () => {
    const token = localStorage.getItem('azureCoveToken');
    if (!token) {
      setLoading(false);
      return;
    }

    try {
      const [roomsResponse, bookingsResponse] = await Promise.all([
        fetchRooms().catch(() => ({ rooms: [] })),
        getUserBookings(token),
      ]);

      setRooms(roomsResponse?.rooms || []);
      setBookings(bookingsResponse?.bookings || []);
      setError('');
    } catch (err) {
      setError(err.message || 'Unable to load bookings.');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadData();
  }, [loadData]);

  // Deep links from the availability checker or a room card pre-fill the booking form.
  useEffect(() => {
    const arrival = searchParams.get('arrival') || '';
    const departure = searchParams.get('departure') || '';
    const adults = searchParams.get('adults') || '2';
    const children = searchParams.get('children') || '0';
    const suite = searchParams.get('suite');

    setForm((current) => ({ ...current, arrival, departure, adults, children }));

    if (suite) {
      setActiveRoom(suite);
      setSelectedRoomNames([suite]);
    }
  }, [searchParams]);

  const openBooking = (roomName) => {
    setActiveRoom(roomName);
    setSelectedRoomNames([roomName]);
    setBookingError('');
  };

  const closeBooking = () => {
    setActiveRoom(null);
    setSelectedRoomNames([]);
    setBookingError('');
  };

  const toggleRoomSelection = (roomName) => {
    setSelectedRoomNames((current) => (
      current.includes(roomName)
        ? current.filter((name) => name !== roomName)
        : [...current, roomName]
    ));
  };

  const selectedRoomDetails = useMemo(
    () => selectedRoomNames
      .map((name) => rooms.find((room) => room.name === name))
      .filter(Boolean),
    [selectedRoomNames, rooms],
  );

  const nights = useMemo(() => {
    if (!form.arrival || !form.departure) return 0;
    const start = new Date(`${form.arrival}T00:00:00`);
    const end = new Date(`${form.departure}T00:00:00`);
    const diff = end.getTime() - start.getTime();
    if (Number.isNaN(diff) || diff <= 0) return 0;
    return Math.round(diff / (1000 * 60 * 60 * 24));
  }, [form.arrival, form.departure]);

  const nightlyTotal = selectedRoomDetails.reduce((sum, room) => sum + Number(room.price || 0), 0);
  const estimatedTotal = nightlyTotal * nights;
  const totalCapacity = selectedRoomDetails.reduce((sum, room) => sum + Number(room.capacity || 0), 0);
  const guestCount = Number(form.adults || 0) + Number(form.children || 0);

  const handleReserve = async () => {
    const token = localStorage.getItem('azureCoveToken');
    if (!token) {
      setBookingError('Please sign in to continue with your booking.');
      return;
    }

    if (selectedRoomNames.length === 0) {
      setBookingError('Select at least one room.');
      return;
    }

    if (!form.arrival || !form.departure) {
      setBookingError('Please choose your arrival and departure dates.');
      return;
    }

    if (nights < 1) {
      setBookingError('Departure must be later than arrival.');
      return;
    }

    if (guestCount > totalCapacity) {
      setBookingError(`Your selected rooms accommodate up to ${totalCapacity} guests.`);
      return;
    }

    setSubmitting(true);
    setBookingError('');

    try {
      const response = await submitBooking({
        arrival: form.arrival,
        departure: form.departure,
        adults: Number(form.adults || 2),
        children: Number(form.children || 0),
        rooms: selectedRoomNames,
      }, token);

      const booking = response?.data;
      setNotice({
        reference: booking?.bookingReference,
        message: 'Thank you for booking! Please wait for confirmation.',
      });
      closeBooking();
      await loadData();
    } catch (err) {
      setBookingError(err.message || 'Unable to create the reservation.');
    } finally {
      setSubmitting(false);
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
      <div className="section-shell space-y-10">
        <div>
          <span className="badge badge-primary">Your reservations</span>
          <h1 className="mt-4 text-heading-xl">My Bookings</h1>
          <p className="mt-2 text-body-md text-text-secondary dark:text-dark-text-secondary">
            Reserve a suite, follow your confirmation, and settle payment when our team approves your stay.
          </p>
        </div>

        {notice ? (
          <div className="card-surface-elevated border-l-4 border-state-success p-5">
            <p className="text-body-md font-semibold text-state-success">{notice.message}</p>
            {notice.reference ? (
              <p className="mt-1 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                Reference <span className="font-mono text-text-primary dark:text-dark-text-primary">{notice.reference}</span>
              </p>
            ) : null}
          </div>
        ) : null}

        <section className="space-y-5">
          <div className="flex items-end justify-between gap-4">
            <h2 className="text-heading-lg">Available rooms</h2>
            <span className="text-body-sm text-text-muted dark:text-dark-text-muted">{rooms.length} room types</span>
          </div>

          <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-3">
            {rooms.map((room) => (
              <article key={room.id || room.name} className="card-surface-elevated overflow-hidden">
                {room.image ? (
                  <img src={room.image} alt={room.name} className="h-44 w-full object-cover" />
                ) : null}
                <div className="p-5">
                  <div className="flex items-start justify-between gap-3">
                    <h3 className="text-heading-sm">{room.name}</h3>
                    <span className="text-body-sm font-semibold text-resort-600 dark:text-resort-400">
                      {currency(room.price)}<span className="text-text-muted dark:text-dark-text-muted"> /night</span>
                    </span>
                  </div>

                  <p className="mt-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                    Sleeps {room.capacity} · {room.type}
                  </p>

                  {room.amenities?.length ? (
                    <ul className="mt-3 space-y-1.5">
                      {room.amenities.slice(0, 3).map((amenity) => (
                        <li key={amenity} className="flex items-center gap-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                          <span className="h-1.5 w-1.5 rounded-full bg-resort-500" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  ) : null}

                  <button type="button" onClick={() => openBooking(room.name)} className="mt-5 w-full btn-primary">
                    Book Now
                  </button>
                </div>
              </article>
            ))}
          </div>
        </section>

        <section className="space-y-5">
          <h2 className="text-heading-lg">Your reservations</h2>

          {bookings.length === 0 ? (
            <div className="card-surface-elevated p-10 text-center">
              <p className="text-body-lg text-text-secondary dark:text-dark-text-secondary">You have no reservations yet.</p>
              <p className="mt-2 text-body-sm text-text-muted dark:text-dark-text-muted">Choose a room above to get started.</p>
            </div>
          ) : (
            <div className="space-y-5">
              {bookings.map((booking) => {
                const meta = statusMeta[booking.status] || statusMeta.pending;
                const balance = Math.max(0, Number(booking.totalAmount || 0) - Number(booking.amountPaid || 0));

                return (
                  <article key={booking.id} className="card-surface-elevated p-6">
                    <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
                      <div>
                        <p className="font-mono text-body-sm text-text-muted dark:text-dark-text-muted">
                          {booking.bookingReference || booking.id}
                        </p>
                        <h3 className="mt-1 text-heading-md">
                          {(booking.rooms || []).map((room) => room.name).join(' + ') || booking.suite}
                        </h3>
                        <p className="mt-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                          {formatDate(booking.arrival)} → {formatDate(booking.departure)} · {booking.nights || 1} night{(booking.nights || 1) === 1 ? '' : 's'}
                        </p>
                        <p className="mt-1 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                          {booking.adults} adult{booking.adults === 1 ? '' : 's'}
                          {booking.children ? `, ${booking.children} child${booking.children === 1 ? '' : 'ren'}` : ''}
                        </p>
                      </div>

                      <div className="md:text-right">
                        <span className={meta.className}>{meta.label}</span>
                        <p className="mt-3 text-body-lg font-semibold">{currency(booking.totalAmount)}</p>
                        {Number(booking.amountPaid) > 0 ? (
                          <p className="text-body-sm text-text-secondary dark:text-dark-text-secondary">
                            Paid {currency(booking.amountPaid)} · Balance {currency(balance)}
                          </p>
                        ) : null}
                      </div>
                    </div>

                    <p className="mt-4 text-body-sm text-text-muted dark:text-dark-text-muted">{meta.hint}</p>

                    {booking.paymentReference ? (
                      <p className="mt-1 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                        Payment reference <span className="font-mono text-text-primary dark:text-dark-text-primary">{booking.paymentReference}</span>
                      </p>
                    ) : null}

                    {booking.status === 'processing' ? (
                      <div className="mt-5">
                        <Link to={`/checkout?bookingId=${booking.id}`} className="btn-primary">
                          Pay Now
                        </Link>
                      </div>
                    ) : null}
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </div>

      {activeRoom ? (
        <div className="modal-overlay" role="presentation" onClick={closeBooking}>
          <div
            className="modal-content modal-lg max-h-[90vh] overflow-y-auto"
            role="dialog"
            aria-modal="true"
            onClick={(event) => event.stopPropagation()}
          >
            {(() => {
              const room = rooms.find((entry) => entry.name === activeRoom);
              return room ? (
                <>
                  {room.image ? (
                    <img src={room.image} alt={room.name} className="h-56 w-full rounded-2xl object-cover" />
                  ) : null}

                  <h2 className="mt-5 text-heading-lg">{room.name}</h2>
                  <p className="mt-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                    Sleeps {room.capacity} · {currency(room.price)} per night
                  </p>

                  {room.amenities?.length ? (
                    <ul className="mt-4 grid gap-2 sm:grid-cols-2">
                      {room.amenities.map((amenity) => (
                        <li key={amenity} className="flex items-center gap-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                          <span className="h-1.5 w-1.5 rounded-full bg-resort-500" />
                          {amenity}
                        </li>
                      ))}
                    </ul>
                  ) : null}
                </>
              ) : null;
            })()}

            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              <div className="form-group">
                <label className="form-label" htmlFor="modal-arrival">Arrival</label>
                <input
                  id="modal-arrival"
                  type="date"
                  min={today}
                  value={form.arrival}
                  onChange={(event) => setForm((current) => ({ ...current, arrival: event.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-departure">Departure</label>
                <input
                  id="modal-departure"
                  type="date"
                  min={form.arrival || today}
                  value={form.departure}
                  onChange={(event) => setForm((current) => ({ ...current, departure: event.target.value }))}
                  className="form-input"
                />
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-adults">Adults</label>
                <select
                  id="modal-adults"
                  value={form.adults}
                  onChange={(event) => setForm((current) => ({ ...current, adults: event.target.value }))}
                  className="form-select"
                >
                  {range(1, PRESET_MAX).map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                  <option value={String(MAX_GUESTS)}>{MAX_GUESTS}</option>
                </select>
              </div>

              <div className="form-group">
                <label className="form-label" htmlFor="modal-children">Children</label>
                <select
                  id="modal-children"
                  value={form.children}
                  onChange={(event) => setForm((current) => ({ ...current, children: event.target.value }))}
                  className="form-select"
                >
                  {range(0, PRESET_MAX).map((count) => (
                    <option key={count} value={count}>{count}</option>
                  ))}
                  <option value={String(MAX_GUESTS)}>{MAX_GUESTS}</option>
                </select>
              </div>
            </div>

            <div className="mt-6">
              <p className="text-body-sm font-medium text-text-primary dark:text-dark-text-primary">Add more rooms</p>
              <p className="mt-1 text-body-sm text-text-muted dark:text-dark-text-muted">
                Reserve extra rooms for the same dates.
              </p>
              <div className="mt-3 grid gap-2 sm:grid-cols-2">
                {rooms.map((option) => (
                  <label
                    key={option.id || option.name}
                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-border bg-surface p-3 text-body-sm dark:border-dark-border dark:bg-dark-surface"
                  >
                    <input
                      type="checkbox"
                      checked={selectedRoomNames.includes(option.name)}
                      onChange={() => toggleRoomSelection(option.name)}
                      className="form-checkbox"
                    />
                    <span className="text-text-secondary dark:text-dark-text-secondary">
                      {option.name} · {currency(option.price)}
                    </span>
                  </label>
                ))}
              </div>
            </div>

            <div className="mt-6 rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
              <div className="flex items-center justify-between text-body-sm text-text-secondary dark:text-dark-text-secondary">
                <span>{selectedRoomNames.length} room{selectedRoomNames.length === 1 ? '' : 's'} · {nights} night{nights === 1 ? '' : 's'}</span>
                <span className="font-semibold text-text-primary dark:text-dark-text-primary">{currency(estimatedTotal)}</span>
              </div>
              <p className="mt-2 text-body-sm text-text-muted dark:text-dark-text-muted">
                {guestCount} guest{guestCount === 1 ? '' : 's'} · capacity {totalCapacity}
              </p>
            </div>

            {bookingError ? (
              <p className="mt-4 text-body-sm text-state-error">{bookingError}</p>
            ) : null}

            <div className="mt-6 flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={closeBooking} className="btn-secondary flex-1">
                Cancel
              </button>
              <button
                type="button"
                onClick={handleReserve}
                disabled={submitting}
                className="btn-primary flex-1"
              >
                {submitting ? 'Reserving...' : 'Reserve Now'}
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </div>
  );
}
