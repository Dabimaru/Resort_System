import { useNavigate } from 'react-router-dom';
import { resortData } from '../data/resortData';

export default function RoomShowcase() {
  const navigate = useNavigate();

  const reserveRoom = (roomName) => {
    const token = localStorage.getItem('azureCoveToken');

    // Signed-in guests continue in My Bookings; guests are sent to the availability checker.
    if (token) {
      navigate(`/my-bookings?suite=${encodeURIComponent(roomName)}`);
      return;
    }

    localStorage.setItem('selectedSuite', roomName);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="suites" className="bg-surface-elevated/50 py-24 dark:bg-dark-surface-elevated/50">
      <div className="section-shell">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-resort-600 dark:border-resort-500/30 dark:bg-resort-500/20 dark:text-resort-400">
              Stay options
            </span>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary dark:text-dark-text-primary md:text-5xl">Room collections</h2>
          </div>
          <a href="#booking" className="hidden btn-ghost md:inline-flex">
            View all suites
          </a>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {resortData.rooms.map((room) => (
            <article key={room.name} className="overflow-hidden rounded-[1.75rem] border border-border bg-surface dark:border-dark-border dark:bg-dark-surface">
              <img src={room.image} alt={room.name} className="h-72 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">{room.name}</h3>
                  <span className="text-sm font-medium text-resort-600 dark:text-resort-400">{room.price}</span>
                </div>
                <p className="mt-4 text-text-secondary dark:text-dark-text-secondary">{room.description}</p>
                <ul className="mt-5 space-y-3 text-sm text-text-secondary dark:text-dark-text-secondary">
                  {room.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-resort-500" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => reserveRoom(room.name)}
                  className="mt-6 w-full rounded-full bg-resort-500 px-5 py-2.5 text-sm font-semibold text-text-inverse hover:bg-resort-400"
                >
                  Reserve room
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
