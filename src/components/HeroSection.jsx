import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

export default function HeroSection() {
  return (
    <section id="stay" className="relative isolate overflow-hidden bg-surface dark:bg-dark-surface">
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{
          backgroundImage:
            "url('https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=1800&q=80')",
        }}
      />
      <div className="absolute inset-0 bg-hero-gradient dark:bg-dark-hero-gradient" />

      <div className="section-shell relative grid min-h-[720px] items-center gap-10 py-20 lg:grid-cols-[1.2fr_0.8fr]">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.22em] text-resort-600 dark:border-resort-500/30 dark:bg-resort-500/20 dark:text-resort-400">
            Coastal luxury stays
          </span>
          <h1 className="mt-6 text-5xl font-semibold tracking-tight text-text-primary dark:text-dark-text-primary md:text-6xl">
            Escape to your own private horizon.
          </h1>
          <p className="mt-6 max-w-xl text-lg text-text-secondary dark:text-dark-text-secondary md:text-xl">
            {resortData.tagline}
          </p>

          <div className="mt-10 flex flex-wrap gap-4">
            <Link
              to="/#booking"
              className="rounded-full bg-resort-500 px-7 py-3.5 text-sm font-semibold text-text-inverse transition hover:bg-resort-400"
            >
              Reserve a stay
            </Link>
            <Link
              to="/#gallery"
              className="rounded-full border border-border bg-surface-elevated/80 px-7 py-3.5 text-sm font-semibold text-text-primary transition hover:border-border-strong hover:bg-surface-overlay dark:border-dark-border dark:bg-dark-surface-elevated/80 dark:text-dark-text-primary dark:hover:border-dark-border-strong dark:hover:bg-dark-surface-overlay"
            >
              View gallery
            </Link>
          </div>

          <div className="mt-12 grid grid-cols-2 gap-6 sm:grid-cols-4">
            {resortData.stats.map((stat) => (
              <div key={stat.label} className="rounded-2xl border border-border bg-surface-elevated/80 p-4 backdrop-blur-sm dark:border-dark-border dark:bg-dark-surface-elevated/80">
                <div className="text-2xl font-semibold text-text-primary dark:text-dark-text-primary">{stat.value}</div>
                <div className="mt-2 text-xs uppercase tracking-[0.16em] text-text-muted dark:text-dark-text-muted">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>

        <div className="rounded-[2rem] border border-border bg-surface-elevated/80 p-6 shadow-glow backdrop-blur-xl dark:border-dark-border dark:bg-dark-surface-elevated/80">
          <div className="rounded-[1.5rem] bg-surface p-5 dark:bg-dark-surface">
            <div className="flex items-center justify-between">
              <p className="text-sm uppercase tracking-[0.22em] text-text-muted dark:text-dark-text-muted">Featured stay</p>
              <span className="rounded-full bg-state-success/20 px-2 py-1 text-xs font-medium text-state-success dark:bg-state-success/20 dark:text-state-success">
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
                <div className="text-sm uppercase tracking-[0.18em] text-text-muted dark:text-dark-text-muted">Laguna Suite</div>
                <div className="mt-2 text-3xl font-semibold text-text-primary dark:text-dark-text-primary">$420<span className="text-base text-text-muted dark:text-dark-text-muted"> / night</span></div>
              </div>
              <Link
                to="/#booking"
                className="rounded-full bg-resort-500 px-4 py-2 text-sm font-medium text-text-inverse hover:bg-resort-400"
              >
                Book
              </Link>
            </div>

            <div className="mt-6 space-y-3 text-sm text-text-secondary dark:text-dark-text-secondary">
              <div className="flex items-center justify-between border-b border-border pb-2 dark:border-dark-border">
                <span>Check in</span>
                <span className="text-text-primary dark:text-dark-text-primary">Fri, 20 Dec</span>
              </div>
              <div className="flex items-center justify-between border-b border-border pb-2 dark:border-dark-border">
                <span>Check out</span>
                <span className="text-text-primary dark:text-dark-text-primary">Sun, 22 Dec</span>
              </div>
              <div className="flex items-center justify-between">
                <span>Guests</span>
                <span className="text-text-primary dark:text-dark-text-primary">2 Adults</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}