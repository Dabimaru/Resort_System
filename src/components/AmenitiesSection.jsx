import { resortData } from '../data/resortData';

export default function AmenitiesSection() {
  return (
    <section id="experiences" className="py-24 bg-surface dark:bg-dark-surface">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-resort-600 dark:border-resort-500/30 dark:bg-resort-500/20 dark:text-resort-400">
            Resort details
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary dark:text-dark-text-primary md:text-5xl">Curated comforts, every day.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {resortData.amenities.map((item) => (
            <div key={item.title} className="card-surface p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-resort-500/10 text-xl text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">
                ✦
              </div>
              <h3 className="text-xl font-semibold text-text-primary dark:text-dark-text-primary">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-text-secondary dark:text-dark-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}