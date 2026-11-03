import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { checkAvailability, submitBooking } from '../services/api';

const initialForm = {
  arrival: '',
  departure: '',
  adults: '2',
  children: '0',
  rooms: '1',
  suite: 'Laguna Suite',
};

export default function BookingForm() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState('availability');
  const [availableRooms, setAvailableRooms] = useState([]);
  const [selectedRoom, setSelectedRoom] = useState(null);
  const [bookingData, setBookingData] = useState(null);
  const today = new Date().toISOString().slice(0, 10);
  const navigate = useNavigate();

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

  const totalGuests = Number(form.adults) + Number(form.children);

  const handleAvailabilityCheck = async (event) => {
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

      if (totalGuests < 1) {
        throw new Error('At least 1 guest is required.');
      }

      const response = await checkAvailability({
        arrival: form.arrival,
        departure: form.departure,
        guests: totalGuests,
        suite: form.suite,
      });

      if (response.isBlockedByAdmin || response.blockedDates?.length) {
        const note = response.note ? ` Admin note: ${response.note}` : '';
        setStatus({
          type: 'error',
          message: `That date is not available. Please choose different dates or another room type.${note}`,
        });
        setAvailableRooms([]);
      } else if (response.availableCount > 0 && response.rooms?.length) {
        setAvailableRooms(response.rooms);
        setSelectedRoom(response.rooms[0]?.name || form.suite);
        setStatus({
          type: 'success',
          message: `Found ${response.availableCount} available room(s). Select your room and click "Book Now" to continue.`,
        });
        setStep('booking');
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

  const handleBookNow = async () => {
    if (!selectedRoom) return;

    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await submitBooking({
        arrival: form.arrival,
        departure: form.departure,
        guests: totalGuests,
        suite: selectedRoom,
      });

      setBookingData(response.data);
      setStatus({
        type: 'success',
        message: `Booking created! Reference: ${response.data.bookingReference}. Redirecting to checkout...`,
      });

      setTimeout(() => {
        navigate(`/checkout?bookingId=${response.data.id}&bookingRef=${response.data.bookingReference}`);
      }, 2000);
    } catch (error) {
      setStatus({
        type: 'error',
        message: error.message || 'Unable to create booking.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleBackToAvailability = () => {
    setStep('availability');
    setAvailableRooms([]);
    setSelectedRoom(null);
    setStatus({ type: '', message: '' });
  };

  const roomTypeLabels = {
    'Laguna Suite': 'Suite',
    'Palm Courtyard Villa': 'Villa',
    'Coral Horizon Room': 'Room',
  };

  if (step === 'availability') {
    return (
      <form onSubmit={handleAvailabilityCheck} className="card-surface-elevated p-6 shadow-glow rounded-3xl">
        <div className="mb-6">
          <p className="text-caption text-resort-300">Check availability</p>
          <h3 className="mt-2 text-heading-lg text-text-primary">Plan your next escape</h3>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
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
          <div className="form-group">
            <label className="form-label" htmlFor="adults">Adults</label>
            <select
              id="adults"
              name="adults"
              value={form.adults}
              onChange={handleChange}
              className="form-select"
            >
              <option value="1">1 Adult</option>
              <option value="2">2 Adults</option>
              <option value="3">3 Adults</option>
              <option value="4">4 Adults</option>
              <option value="5">5 Adults</option>
              <option value="6">6 Adults</option>
            </select>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="children">Children</label>
            <select
              id="children"
              name="children"
              value={form.children}
              onChange={handleChange}
              className="form-select"
            >
              <option value="0">0 Children</option>
              <option value="1">1 Child</option>
              <option value="2">2 Children</option>
              <option value="3">3 Children</option>
              <option value="4">4 Children</option>
            </select>
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label" htmlFor="rooms">Rooms</label>
            <select
              id="rooms"
              name="rooms"
              value={form.rooms}
              onChange={handleChange}
              className="form-select"
            >
              <option value="1">1 Room</option>
              <option value="2">2 Rooms</option>
              <option value="3">3 Rooms</option>
            </select>
          </div>
          <div className="form-group md:col-span-2">
            <label className="form-label" htmlFor="suite">Suite Type</label>
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

        <button
          type="submit"
          disabled={loading}
          className="btn-primary w-full mt-6"
        >
          {loading ? 'Checking...' : 'Check availability'}
        </button>

        {status.message ? (
          <div className="mt-4 space-y-2">
            <p className={`text-body-sm ${status.type === 'success' ? 'text-state-success' : 'text-state-error'}`}>
              {status.message}
            </p>
            {status.type === 'success' ? (
              <Link to="/auth" className="text-link text-body-sm font-medium">
                Go to guest login
              </Link>
            ) : null}
          </div>
        ) : null}
      </form>
    );
  }

  if (step === 'booking') {
    const room = availableRooms.find(r => r.name === selectedRoom);

    return (
      <div className="card-surface-elevated p-6 shadow-glow rounded-3xl space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-caption text-resort-300">Select your room</p>
            <h3 className="mt-2 text-heading-lg text-text-primary">Available: {availableRooms.length} room(s)</h3>
          </div>
          <button
            onClick={handleBackToAvailability}
            className="btn-ghost btn-sm"
          >
            ← Change dates
          </button>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          {availableRooms.map((r) => (
            <button
              key={r.name}
              type="button"
              onClick={() => setSelectedRoom(r.name)}
              className={`card-interactive p-4 relative ${
                selectedRoom === r.name
                  ? 'border-state-info bg-state-info/5'
                  : ''
              }`}
            >
              {selectedRoom === r.name && (
                <div className="absolute top-3 right-3 h-5 w-5 rounded-full bg-state-info flex items-center justify-center">
                  <svg className="h-3 w-3 text-text-inverse" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" /></svg>
                </div>
              )}
              <h4 className="font-semibold text-text-primary">{r.name}</h4>
              <p className="text-body-sm text-text-muted mt-1">{roomTypeLabels[r.name] || r.type}</p>
              <p className="text-body-sm text-text-secondary mt-2">Capacity: {r.capacity} guests</p>
              <p className="text-heading-sm font-semibold text-resort-300 mt-2">${r.price}/night</p>
              <div className="mt-3 space-y-1 text-caption text-text-secondary">
                {(r.amenities || []).slice(0, 3).map((a, i) => (
                  <div key={i} className="flex items-center gap-1.5">
                    <span className="h-1.5 w-1.5 rounded-full bg-resort-400" />
                    {a}
                  </div>
                ))}
              </div>
            </button>
          ))}
        </div>

        {status.message && (
          <div className={`rounded-xl p-3 ${status.type === 'success' ? 'bg-state-success/10 border border-state-success/20 text-state-success' : 'bg-state-error/10 border border-state-error/20 text-state-error'}`}>
            {status.message}
          </div>
        )}

        <div className="flex gap-3 pt-4 border-t border-border">
          <button
            onClick={handleBackToAvailability}
            className="btn-secondary flex-1"
          >
            Back
          </button>
          <button
            onClick={handleBookNow}
            disabled={loading || !selectedRoom}
            className="btn-primary flex-1"
          >
            {loading ? 'Booking...' : 'Book Now'}
          </button>
        </div>
      </div>
    );
  }

  return null;
}
