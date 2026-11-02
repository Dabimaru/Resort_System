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
    <section id="stay" className="relative isolate overflow-hidden bg-slate-950">
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
          <span className="inline-flex rounded-full border border-white/15 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-resort-200">
            Coastal luxury stays
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-white md:text-6xl">
            Escape to your own private horizon.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-slate-200 md:text-xl">
            {resortData.tagline}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <a
              href="#booking"
              onClick={scrollToBooking}
              className="rounded-full bg-resort-500 px-7 py-3.5 text-sm font-semibold text-slate-950 transition hover:bg-resort-400"
            >
              Reserve a stay
            </a>
            <a
              href="#experiences"
              className="rounded-full border border-white/20 bg-white/5 px-7 py-3.5 text-sm font-semibold text-white transition hover:border-white/40 hover:bg-white/10"
            >
              View experiences
            </a>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {resortData.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-white/10 bg-slate-950/30 p-4 backdrop-blur-sm">
                <div className="text-2xl font-semibold text-white">{stat.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-slate-300">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-white/15 bg-white/10 p-6 shadow-glow backdrop-blur-xl">
          <div className="rounded-[1.5rem] bg-slate-950/60 p-5">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.22em] text-slate-300">Featured stay</p>
              <span className="rounded-full bg-emerald-500/20 px-2 py-1 text-xs font-medium text-emerald-300">
                Available now
              </span>
            </div>

            <img
              src="https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=1000&q=80"
              alt="Luxury resort room"
              className="mt-5 h-56 w-full rounded-2xl object-cover"
            />

            <div className="mt-6 flex items-end justify-between">
              <div>
                <div className="text-sm uppercase tracking-[0.18em] text-slate-400">Laguna Suite</div>
                <div className="mt-2 text-3xl font-semibold text-white">$420<span className="text-base text-slate-400"> / night</span></div>
              </div>
              <a
                href="#booking"
                onClick={scrollToBooking}
                className="rounded-full bg-white px-4 py-2 text-sm font-medium text-slate-900 hover:bg-slate-100"
              >
                Book
              </a>
            </div>

            <div className="mt-6 space-y-3 text-sm text-slate-200">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <span>Check in</span>
                <span>Fri, 20 Dec</span>
              </div>
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
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
