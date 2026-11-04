import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { checkAvailability } from '../services/api';

const initialForm = {
  arrival: '',
  departure: '',
  guests: '2',
  suite: 'Laguna Suite',
};

export default function BookingForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const today = new Date().toISOString().slice(0, 10);

  useEffect(() => {
    const savedSuite = localStorage.getItem('selectedSuite');
    if (savedSuite) {
      setForm((current) => ({ ...current, suite: savedSuite }));
      localStorage.removeItem('selectedSuite');
    }
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const arrivalDate = new Date(form.arrival);
      const departureDate = new Date(form.departure);

      if (!form.arrival || !form.departure) {
        throw new Error('Please select both arrival and departure dates.');
      }

      if (arrivalDate >= departureDate) {
        throw new Error('Departure must be later than arrival.');
      }

      const response = await checkAvailability({
        arrival: form.arrival,
        departure: form.departure,
        guests: form.guests,
        suite: form.suite,
      });

      const rooms = response.rooms && response.rooms.length > 0 ? response.rooms.map((room) => room.name).join(', ') : 'No rooms';

      if (response.isBlockedByAdmin || response.blockedDates?.length) {
        const note = response.note ? ` Admin note: ${response.note}` : '';
        setStatus({
          type: 'error',
          message: `That date is not available. Please choose different dates or another room type.${note}`,
        });
      } else if (response.availableCount > 0) {
        setStatus({
          type: 'success',
          message: `Available for your selected dates. Available rooms: ${rooms}. Please log in to continue with the booking.`,
        });
      } else {
        setStatus({
          type: 'error',
          message: 'That date is not available. Please choose different dates or another room type.',
        });
      }
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to check availability.',
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className="rounded-[2rem] border border-border bg-surface-elevated p-6 shadow-glow dark:border-dark-border dark:bg-dark-surface-elevated">
      <div className="mb-6">
        <p className="text-xs uppercase tracking-[0.22em] text-resort-600 dark:text-resort-400">Check availability</p>
        <h3 className="mt-2 text-2xl font-semibold text-text-primary dark:text-dark-text-primary">Plan your next escape</h3>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <label className="block text-sm text-text-secondary dark:text-dark-text-secondary">
          <span className="mb-2 block">Arrival</span>
          <input
            type="date"
            name="arrival"
            value={form.arrival}
            min={today}
            onChange={handleChange}
            className="form-input"
          />
        </label>
        <label className="block text-sm text-text-secondary dark:text-dark-text-secondary">
          <span className="mb-2 block">Departure</span>
          <input
            type="date"
            name="departure"
            value={form.departure}
            min={form.arrival || today}
            onChange={handleChange}
            className="form-input"
          />
        </label>
        <label className="block text-sm text-text-secondary dark:text-dark-text-secondary">
          <span className="mb-2 block">Guests</span>
          <select
            name="guests"
            value={form.guests}
            onChange={handleChange}
            className="form-select"
          >
            <option value="2">2 Adults</option>
            <option value="3">3 Adults</option>
            <option value="4">4 Adults</option>
            <option value="5">Family</option>
          </select>
        </label>
        <label className="block text-sm text-text-secondary dark:text-dark-text-secondary">
          <span className="mb-2 block">Suite</span>
          <select
            name="suite"
            value={form.suite}
            onChange={handleChange}
            className="form-select"
          >
            <option>Laguna Suite</option>
            <option>Palm Courtyard Villa</option>
            <option>Coral Horizon Room</option>
          </select>
        </label>
      </div>

      <button
        type="submit"
        disabled={loading}
        className="mt-6 w-full rounded-full bg-resort-500 px-5 py-3 font-semibold text-text-inverse transition hover:bg-resort-400 disabled:cursor-not-allowed disabled:opacity-70"
      >
        {loading ? 'Checking...' : 'Check availability'}
      </button>

      {status.message ? (
        <div className="mt-4 space-y-2">
          <p className={`text-sm ${status.type === 'success' ? 'text-state-success' : 'text-state-error'}`}>
            {status.message}
          </p>
          {status.type === 'success' ? (
            <Link to="/auth" className="inline-flex text-sm font-medium text-resort-600 underline underline-offset-4 hover:text-resort-400 dark:text-resort-400 dark:hover:text-resort-200">
              Go to guest login
            </Link>
          ) : null}
        </div>
      ) : null}
    </form>
  );
}