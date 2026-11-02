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
    <section id="suites" className="bg-slate-900/80 py-24">
      <div className="section-shell">
        <div className="flex items-end justify-between gap-6">
          <div>
            <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
              Stay options
            </span>
            <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">Room collections</h2>
          </div>
          <a href="#booking" className="hidden rounded-full border border-white/15 px-5 py-3 text-sm text-white hover:border-white/30 md:inline-flex">
            View all suites
          </a>
        </div>

        <div className="mt-12 grid gap-8 lg:grid-cols-3">
          {resortData.rooms.map((room) => (
            <article key={room.name} className="overflow-hidden rounded-[1.75rem] border border-white/10 bg-slate-950">
              <img src={room.image} alt={room.name} className="h-72 w-full object-cover" />
              <div className="p-6">
                <div className="flex items-center justify-between gap-4">
                  <h3 className="text-2xl font-semibold text-white">{room.name}</h3>
                  <span className="text-sm font-medium text-resort-200">{room.price}</span>
                </div>
                <p className="mt-4 text-slate-300">{room.description}</p>
                <ul className="mt-5 space-y-3 text-sm text-slate-200">
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
                  className="mt-6 rounded-full bg-resort-500 px-5 py-2.5 text-sm font-semibold text-slate-950 hover:bg-resort-400"
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
