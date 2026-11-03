import { resortData } from '../data/resortData';

export default function HeroSection() {
  const scrollToBooking = (event) => {
    event.preventDefault();
    const bookingSection = document.getElementById('booking');
    if (bookingSection) {
      bookingSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <section id="stay" className="relative isolate overflow-hidden bg-surface">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-hero-gradient" />

      <div className="section-shell relative grid min-h-[720px] items-center gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-2xl">
          <span className="badge badge-info">Coastal luxury stays</span>
          <h1 className="mt-6 text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">
            Escape to your own private horizon.
          </h1>
          <p className="mt-6 max-w-xl text-body-lg text-text-secondary md:text-body-lg">
            {resortData.tagline}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#booking"
              onClick={scrollToBooking}
              className="btn-primary"
            >
              Reserve a stay
            </a>
            <a
              href="#experiences"
              className="btn-outline"
            >
              View experiences
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {resortData.stats.map((stat) => (
              <div key={stat.label} className="card-surface p-4 backdrop-blur-sm">
                <div className="text-heading-lg font-semibold text-text-primary">{stat.value}</div>
                <div className="mt-2 text-caption text-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="card-surface-elevated p-6 shadow-glow rounded-3xl backdrop-blur-xl">
          <div className="card-surface p-5 rounded-2xl">
            <div className="flex items-center justify-between">
              <p className="text-caption text-text-muted">Featured stay</p>
              <span className="badge badge-success">Available now</span>
            </div>

            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
              alt="Luxury resort room"
              className="mt-5 h-56 w-full rounded-2xl object-cover"
            />

            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="text-caption text-text-muted">Laguna Suite</div>
                <div className="mt-2 text-heading-xl font-semibold text-text-primary">$420<span className="text-body text-text-muted"> / night</span></div>
              </div>
              <a
                href="#booking"
                onClick={scrollToBooking}
                className="btn-secondary"
              >
                Book
              </a>
            </div>

            <div className="mt-6 space-y-3 text-body-sm text-text-secondary">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>Check in</span>
                <span>Fri, 20 Dec</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2">
                <span>Check out</span>
                <span>Sun, 22 Dec</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Guests</span>
                <span>2 Adults</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
