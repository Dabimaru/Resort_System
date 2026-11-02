import { resortData } from '../data/resortData';

export default function AmenitiesSection() {
  return (
    <section id="experiences" className="py-24">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
            Resort details
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">Curated comforts, every day.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          {resortData.amenities.map((item) => (
            <div key={item.title} className="card-surface p-6">
              <div className="mb-5 flex h-12 w-12 items-center justify-center rounded-full bg-resort-500/15 text-xl text-resort-200">
                ✦
              </div>
              <h3 className="text-xl font-semibold text-white">{item.title}</h3>
              <p className="mt-4 text-sm leading-6 text-slate-300">{item.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
