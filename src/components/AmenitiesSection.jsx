import { resortData } from '../data/resortData';

export default function AmenitiesSection() {
  return (
    <section id="experiences" className="bg-resort-950 py-20 text-white md:py-28">
      <div className="section-shell">
        <div className="grid gap-8 md:grid-cols-[0.8fr_1.2fr] md:items-end">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.18em] text-resort-200">The Azure Cove experience</p>
            <h2 className="mt-4 max-w-lg font-display text-5xl font-medium leading-[1.02] tracking-tight text-white md:text-6xl">
              Thoughtful in every detail.
            </h2>
          </div>
          <p className="max-w-xl text-base leading-7 text-white/70 md:justify-self-end md:text-lg md:leading-8">
            Days here can be as full or as open as you like. We take care of the details, so you can stay with the moment.
          </p>
        </div>

        <div className="mt-14 grid border-t border-white/20 sm:grid-cols-2">
          {resortData.amenities.map((item, index) => (
            <article key={item.title} className="grid grid-cols-[3rem_1fr] gap-4 border-b border-white/20 py-7 sm:gap-6 sm:py-9 [&:nth-child(odd)]:sm:pr-10 [&:nth-child(even)]:sm:pl-10 [&:nth-child(even)]:sm:border-l">
              <span className="pt-1 font-display text-2xl italic text-resort-200" aria-hidden="true">
                0{index + 1}
              </span>
              <div>
                <h3 className="font-display text-3xl font-semibold text-white">{item.title}</h3>
                <p className="mt-3 max-w-md text-sm leading-6 text-white/65">{item.description}</p>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
