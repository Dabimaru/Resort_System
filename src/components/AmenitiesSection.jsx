import { resortData } from '../data/resortData';

export default function AmenitiesSection() {
  return (
    <section id="experiences" className="py-24 bg-surface">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="badge badge-neutral">Resort details</span>
          <h2 className="mt-6 text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">Curated comforts, every day.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {resortData.amenities.map((item) => (
            <div key={item.title} className="card-interactive p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-resort-500/15 text-xl text-resort-300">
                ✦
              </div>
              <h3 className="text-heading-md font-semibold text-text-primary">{item.title}</h3>
              <p className="mt-4 text-body-sm leading-6 text-text-secondary">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
