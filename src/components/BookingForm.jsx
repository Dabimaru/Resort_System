import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAvailability } from '../services/api';

const PRESET_MAX = 10;
const CUSTOM_MAX = 20;

const initialForm = {
  arrival: '',
  departure: '',
  adults: '2',
  children: '0',
  suite: 'Laguna Suite',
};

const range = (start, end) => Array.from({ length: end - start + 1 }, (_, index) => start + index);

export default function BookingForm() {
  const navigate = useNavigate();
  const [form, setForm] = useState(initialForm);
  const [customAdults, setCustomAdults] = useState('');
  const [customChildren, setCustomChildren] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [availability, setAvailability] = useState(null);
  const [loading, setLoading] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(() => Boolean(localStorage.getItem('azureCoveToken')));

  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const syncAuth = () => setIsLoggedIn(Boolean(localStorage.getItem('azureCoveToken')));
    syncAuth();
    window.addEventListener('storage', syncAuth);
    window.addEventListener('focus', syncAuth);
    return () => {
      window.removeEventListener('storage', syncAuth);
      window.removeEventListener('focus', syncAuth);
    };
  }, []);

  useEffect(() => {
    const savedSuite = localStorage.getItem('selectedSuite');
    if (savedSuite) {
      setForm((current) => ({ ...current, suite: savedSuite }));
      localStorage.removeItem('selectedSuite');
    }
  }, []);

  const resolveCount = (presetValue, customValue, fallback) => {
    if (presetValue !== 'custom') {
      return Number(presetValue);
    }

    const parsed = Number.parseInt(customValue, 10);
    return Number.isNaN(parsed) ? fallback : parsed;
  };

  const adults = resolveCount(form.adults, customAdults, 2);
  const children = resolveCount(form.children, customChildren, 0);
  const totalGuests = adults + children;

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
    setAvailability(null);
    setStatus({ type: '', message: '' });
  };

  const handleCustomChange = (setter) => (event) => {
    setter(event.target.value.replace(/[^0-9]/g, '').slice(0, 2));
    setAvailability(null);
    setStatus({ type: '', message: '' });
  };

  const handleCheck = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });
    setAvailability(null);

    try {
      if (!form.arrival || !form.departure) {
        throw new Error('Please select both arrival and departure dates.');
      }

      if (new Date(form.arrival) >= new Date(form.departure)) {
        throw new Error('Departure must be later than arrival.');
      }

      if (adults < 1) {
        throw new Error('At least one adult is required.');
      }

      if (adults > CUSTOM_MAX || children > CUSTOM_MAX) {
        throw new Error(`Adults and children are each limited to ${CUSTOM_MAX}.`);
      }

      const response = await checkAvailability({
        arrival: form.arrival,
        departure: form.departure,
        guests: totalGuests,
        adults,
        children,
        suite: form.suite,
      });

      setAvailability(response);

      if (response.isBlockedByAdmin || response.blockedDates?.length) {
        const note = response.note ? ` Admin note: ${response.note}` : '';
        setStatus({
          type: 'error',
          message: `That date is not available. Please choose different dates or another room type.${note}`,
        });
      } else if (response.availableCount > 0) {
        setStatus({
          type: 'success',
          message: `${response.availableCount} room${response.availableCount === 1 ? '' : 's'} available for your dates.`,
        });
      } else {
        setStatus({
          type: 'error',
          message: 'That date is not available. Please choose different dates or another room type.',
        });
      }
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to check availability.' });
    } finally {
      setLoading(false);
    }
  };

  const goToMyBookings = () => {
    const params = new URLSearchParams({
      arrival: form.arrival,
      departure: form.departure,
      adults: String(adults),
      children: String(children),
      suite: form.suite,
    });
    navigate(`/my-bookings?${params.toString()}`);
  };

  const renderGuestField = ({ name, label, min, presetValue, customValue, setCustomValue }) => {
    const isCustom = presetValue === 'custom';

    return (
      <div className="form-group">
        <label className="form-label" htmlFor={name}>{label}</label>
        <select
          id={name}
          name={name}
          value={presetValue}
          onChange={handleChange}
          className="form-select"
        >
          {range(min, PRESET_MAX).map((count) => (
            <option key={count} value={count}>{count}</option>
          ))}
          <option value="custom">Custom…</option>
        </select>

        {isCustom ? (
          <input
            type="number"
            min={min}
            max={CUSTOM_MAX}
            value={customValue}
            onChange={handleCustomChange(setCustomValue)}
            placeholder={`${min}–${CUSTOM_MAX}`}
            className="form-input mt-2"
            aria-label={`Custom ${label.toLowerCase()} count`}
          />
        ) : null}
      </div>
    );
  };

  const showAvailableActions = status.type === 'success' && availability?.availableCount > 0;

  return (
    <form onSubmit={handleCheck} className="rounded-[2rem] border border-border bg-surface-elevated p-6 shadow-glow dark:border-dark-border dark:bg-dark-surface-elevated">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-resort-600 dark:text-resort-400">Check availability</p>
        <h3 className="mt-2 text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Plan your next escape</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <div className="form-group">
          <label className="form-label" htmlFor="arrival">Arrival</label>
          <input
            type="date"
            id="arrival"
            name="arrival"
            value={form.arrival}
            min={today}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        <div className="form-group">
          <label className="form-label" htmlFor="departure">Departure</label>
          <input
            type="date"
            id="departure"
            name="departure"
            value={form.departure}
            min={form.arrival || today}
            onChange={handleChange}
            className="form-input"
          />
        </div>

        {renderGuestField({
          name: 'adults',
          label: 'Adults',
          min: 1,
          presetValue: form.adults,
          customValue: customAdults,
          setCustomValue: setCustomAdults,
        })}

        {renderGuestField({
          name: 'children',
          label: 'Children',
          min: 0,
          presetValue: form.children,
          customValue: customChildren,
          setCustomValue: setCustomChildren,
        })}

        <div className="form-group md:col-span-2">
          <label className="form-label" htmlFor="suite">Room type</label>
          <select
            id="suite"
            name="suite"
            value={form.suite}
            onChange={handleChange}
            className="form-select"
          >
            <option>Laguna Suite</option>
            <option>Palm Courtyard Villa</option>
            <option>Coral Horizon Room</option>
          </select>
        </div>
      </div>

      <p className="mt-3 text-body-sm text-text-muted dark:text-dark-text-muted">
        {totalGuests} guest{totalGuests === 1 ? '' : 's'} selected
      </p>

      <button
        type="submit"
        disabled={loading}
        className="mt-5 w-full btn-primary"
      >
        {loading ? 'Checking...' : 'Check availability'}
      </button>

      {status.message ? (
        <div className={`mt-4 rounded-2xl border p-4 text-body-sm ${status.type === 'success' ? 'border-state-success/30 bg-state-success/10 text-state-success' : 'border-state-error/30 bg-state-error/10 text-state-error'}`}>
          {status.message}
        </div>
      ) : null}

      {showAvailableActions ? (
        <div className="mt-4">
          {isLoggedIn ? (
            <div className="rounded-2xl border border-state-success/30 bg-state-success/10 p-4">
              <p className="text-body-md font-semibold text-state-success">The date is available. Book now!</p>
              <button type="button" onClick={goToMyBookings} className="mt-3 w-full btn-primary">
                My Booking
              </button>
            </div>
          ) : (
            <div className="rounded-2xl border border-state-success/30 bg-state-success/10 p-4">
              <p className="text-body-md font-semibold text-state-success">The date is available.</p>
              <p className="mt-1 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                Log in to your guest account to continue with this booking.
              </p>
              <Link to="/auth" className="mt-3 w-full btn-primary text-center">
                Log in to continue booking
              </Link>
            </div>
          )}
        </div>
      ) : null}

      {status.type === 'error' && availability && !availability.isDateAvailable && !isLoggedIn ? (
        <p className="mt-3 text-body-sm text-text-muted dark:text-dark-text-muted">
          You can still browse other dates, or <Link to="/auth" className="text-link">log in</Link> to manage existing reservations.
        </p>
      ) : null}
    </form>
  );
}
