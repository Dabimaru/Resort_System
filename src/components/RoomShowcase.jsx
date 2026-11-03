import { resortData } from '../data/resortData';

export default function RoomShowcase() {
  const reserveRoom = (roomName) => {
    localStorage.setItem('selectedSuite', roomName);
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="suites" className="bg-surface/50 py-24">
      <div className="section-shell">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="badge badge-neutral">Stay options</span>
            <h2 className="mt-6 text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">Room collections</h2>
          </div>
          <a href="#booking" className="btn-outline btn-sm hidden md:inline-flex">
            View all suites
          </a>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {resortData.rooms.map((room) => (
            <article key={room.name} className="card-interactive overflow-hidden rounded-2xl">
              <img src={room.image} alt={room.name} className="h-72 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-heading-lg font-semibold text-text-primary">{room.name}</h3>
                  <span className="text-body-sm font-medium text-resort-300">{room.price}</span>
                </div>
                <p className="mt-4 text-text-secondary">{room.description}</p>
                <ul className="mt-5 space-y-3 text-body-sm text-text-secondary">
                  {room.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-3">
                      <span className="h-2 w-2 rounded-full bg-resort-400" />
                      {feature}
                    </li>
                  ))}
                </ul>
                <button
                  type="button"
                  onClick={() => reserveRoom(room.name)}
                  className="btn-primary mt-6 w-full"
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
