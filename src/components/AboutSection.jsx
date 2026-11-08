import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

const highlights = [
  'A private stretch of shoreline',
  'Unhurried, thoughtful hospitality',
  'Locally inspired food and experiences',
];

export default function AboutSection() {
  return (
    <section id="about" className="overflow-hidden bg-surface py-20 dark:bg-dark-surface md:py-28">
      <div className="section-shell grid items-center gap-12 lg:grid-cols-[1fr_0.9fr] lg:gap-20">
        <div className="relative min-h-[420px] overflow-hidden rounded-md md:min-h-[560px]">
          <img
            src={resortData.gallery[1]}
            alt="Natural coastline surrounding the resort"
            loading="lazy"
            className="absolute inset-0 h-full w-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-t from-[#132d27]/55 via-transparent to-transparent" />
          <p className="absolute bottom-6 left-6 max-w-xs font-display text-3xl italic leading-tight text-white md:bottom-8 md:left-8 md:text-4xl">
            Room to breathe. Time to be.
          </p>
        </div>

        <div className="py-2">
          <p className="section-kicker">Welcome to Azure Cove</p>
          <h2 className="section-title max-w-xl">
            A place to find your own pace.
          </h2>
          <p className="section-description">
            We believe the best escapes leave space for the simple things: a long breakfast, salt in the air, and nowhere else you need to be.
          </p>
          <p className="mt-4 max-w-xl text-base leading-7 text-text-secondary dark:text-dark-text-secondary">
            Set along the coast, Azure Cove pairs the ease of a private hideaway with the warmth of a team who knows when to step in—and when to let the moment be yours.
          </p>

          <ul className="mt-8 space-y-4 border-y border-border py-6 dark:border-dark-border">
            {highlights.map((highlight) => (
              <li key={highlight} className="flex items-center gap-3 text-sm font-medium text-text-primary dark:text-dark-text-primary">
                <span className="flex h-6 w-6 items-center justify-center rounded-full bg-resort-100 text-resort-700 dark:bg-resort-900 dark:text-resort-200" aria-hidden="true">
                  <svg viewBox="0 0 16 16" fill="none" className="h-3.5 w-3.5">
                    <path d="m3.5 8 3 3 6-6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                </span>
                {highlight}
              </li>
            ))}
          </ul>

          <Link to="/#experiences" className="mt-7 inline-flex items-center gap-2 text-sm font-semibold text-resort-700 hover:text-resort-900 dark:text-resort-300 dark:hover:text-resort-100">
            Discover the resort
            <span aria-hidden="true">→</span>
          </Link>
        </div>
      </div>
    </section>
  );
}
