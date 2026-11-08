import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

export default function HeroSection() {
  return (
    <section id="stay" className="relative isolate flex min-h-[650px] items-center overflow-hidden bg-resort-950 text-white md:min-h-[740px]">
      <img
        src="https://images.unsplash.com/photo-1507525428034-b723cf961d3e?auto=format&fit=crop&w=2200&q=88"
        alt="Quiet shoreline and turquoise water at Azure Cove"
        loading="eager"
        className="absolute inset-0 h-full w-full object-cover"
      />
      <div className="absolute inset-0 bg-gradient-to-r from-[#0b211d]/85 via-[#0b211d]/55 to-[#0b211d]/10" />
      <div className="absolute inset-0 bg-gradient-to-t from-[#0b211d]/45 via-transparent to-[#0b211d]/10" />

      <div className="section-shell relative w-full pb-20 pt-24 md:pb-28 md:pt-28">
        <div className="max-w-3xl">
          <p className="mb-6 flex items-center gap-3 text-xs font-semibold uppercase tracking-[0.22em] text-white/80">
            <span className="h-px w-9 bg-white/70" />
            {resortData.contact?.address || 'A quiet stretch of the coast'}
          </p>
          <h1 className="max-w-3xl font-display text-6xl font-medium leading-[0.94] tracking-tight text-white sm:text-7xl md:text-8xl">
            A slower kind
            <br />
            of <span className="italic text-[#e1c49b]">escape.</span>
          </h1>
          <p className="mt-7 max-w-xl text-base leading-7 text-white/80 md:text-lg md:leading-8">
            {resortData.tagline}
          </p>

          <div className="mt-9 flex flex-wrap items-center gap-4">
            <Link to="/#booking" className="inline-flex min-h-12 items-center gap-3 rounded-md bg-[#f0dfc2] px-6 text-sm font-semibold text-[#183a32] transition hover:bg-white">
              Plan your stay
              <svg viewBox="0 0 20 20" fill="none" className="h-4 w-4" aria-hidden="true">
                <path d="M3.5 10h12m-5-5 5 5-5 5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </Link>
            <Link to="/#suites" className="inline-flex min-h-12 items-center rounded-md border border-white/45 px-6 text-sm font-medium text-white transition hover:border-white hover:bg-white/10">
              Explore the suites
            </Link>
          </div>
        </div>

        <div className="mt-20 flex flex-col gap-5 border-t border-white/25 pt-5 text-sm text-white/80 sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-sm">{resortData.company} <span className="mx-2 text-white/40">/</span> An intimate coastal retreat</p>
          <div className="flex flex-wrap gap-x-8 gap-y-2">
            {resortData.stats.slice(0, 3).map((stat) => (
              <p key={stat.label}>
                <span className="mr-2 font-semibold text-white">{stat.value}</span>
                <span className="text-white/65">{stat.label}</span>
              </p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
