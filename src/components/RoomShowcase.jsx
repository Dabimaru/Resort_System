import { Link, useNavigate } from 'react-router-dom';
import { resortData } from '../data/resortData';

export default function RoomShowcase() {
  const navigate = useNavigate();

  const reserveRoom = (roomName) => {
    if (localStorage.getItem('azureCoveToken')) {
      navigate(`/my-bookings?suite=${encodeURIComponent(roomName)}`);
      return;
    }

    localStorage.setItem('selectedSuite', roomName);
    navigate('/#booking');
  };

  return (
    <section id="suites" className="bg-[#efeee7] py-20 dark:bg-dark-surface-elevated md:py-28">
      <div className="section-shell">
        <div className="flex flex-col justify-between gap-6 md:flex-row md:items-end">
          <div className="max-w-2xl">
            <p className="section-kicker">Stay a little longer</p>
            <h2 className="section-title">Suites with a sense of place.</h2>
            <p className="section-description">
              Considered spaces, natural textures, and a view that makes the outside world feel far away.
            </p>
          </div>
          <Link to="/#booking" className="inline-flex items-center gap-2 pb-1 text-sm font-semibold text-resort-700 hover:text-resort-900 dark:text-resort-300 dark:hover:text-resort-100">
            Check availability <span aria-hidden="true">→</span>
          </Link>
        </div>

        <div className="mt-10 grid gap-7 md:grid-cols-2 xl:grid-cols-3">
          {resortData.rooms.map((room, index) => (
            <article key={room.name} className="group min-w-0">
              <button
                type="button"
                onClick={() => reserveRoom(room.name)}
                className="relative block w-full overflow-hidden rounded-md bg-resort-900 text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-resort-600 focus-visible:ring-offset-4"
                aria-label={`Reserve ${room.name}`}
              >
                <img
                  src={room.image}
                  alt={room.name}
                  loading="lazy"
                  className="h-[300px] w-full object-cover transition duration-700 group-hover:scale-[1.035] md:h-[340px]"
                />
                <span className="absolute left-4 top-4 rounded-sm bg-surface/90 px-3 py-1.5 text-[0.68rem] font-semibold uppercase tracking-[0.14em] text-text-primary backdrop-blur">
                  {index === 0 ? 'Oceanfront' : index === 1 ? 'Private villa' : 'Coastal room'}
                </span>
                <span className="absolute bottom-4 right-4 flex h-10 w-10 translate-y-2 items-center justify-center rounded-full bg-white text-resort-800 opacity-0 transition duration-300 group-hover:translate-y-0 group-hover:opacity-100" aria-hidden="true">
                  <svg viewBox="0 0 20 20" fill="none" className="h-5 w-5">
                    <path d="M4 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
              </button>

              <div className="pt-5">
                <div className="flex items-start justify-between gap-4">
                  <h3 className="font-display text-3xl font-semibold leading-tight text-text-primary dark:text-dark-text-primary">{room.name}</h3>
                  <p className="shrink-0 pt-1 text-right text-sm font-medium text-text-primary dark:text-dark-text-primary">
                    {room.price.replace('/night', '')}
                    <span className="mt-0.5 block text-xs font-normal text-text-muted dark:text-dark-text-muted">per night</span>
                  </p>
                </div>
                <p className="mt-3 min-h-[3.5rem] text-sm leading-6 text-text-secondary dark:text-dark-text-secondary">{room.description}</p>
                <div className="mt-4 flex flex-wrap gap-x-4 gap-y-2 border-t border-border pt-4 text-xs text-text-muted dark:border-dark-border dark:text-dark-text-muted">
                  {room.features.map((feature) => <span key={feature}>{feature}</span>)}
                </div>
                <button
                  type="button"
                  onClick={() => reserveRoom(room.name)}
                  className="mt-5 text-sm font-semibold text-resort-700 transition hover:text-resort-900 dark:text-resort-300 dark:hover:text-resort-100"
                >
                  Reserve room <span aria-hidden="true">→</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
