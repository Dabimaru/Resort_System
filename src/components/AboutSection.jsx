export default function AboutSection() {
  return (
    <section id="about" className="py-24">
      <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-resort-200">
            About the resort
          </span>
          <h2 className="text-4xl font-semibold tracking-tight text-white md:text-5xl">
            Thoughtful luxury rooted in place.
          </h2>
          <p className="text-lg text-slate-300">
            Azure Cove blends contemporary comfort with the natural rhythm of the coast — an intimate hideaway shaped by warm hospitality, restorative rituals, and breathtaking sea views.
          </p>
          <p className="text-slate-400">
            From our sunrise spa rituals and chef-led dining to curated island journeys, every stay is designed to feel elevated, effortless, and deeply personal.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card-surface overflow-hidden p-5">
            <div className="mb-4 text-3xl text-resort-200">01</div>
            <h3 className="text-xl font-semibold text-white">Immersive experiences</h3>
            <p className="mt-3 text-sm text-slate-300">Private boat charters, guided snorkeling, and disappearing into the shoreline at golden hour.</p>
          </div>
          <div className="card-surface overflow-hidden p-5">
            <div className="mb-4 text-3xl text-resort-200">02</div>
            <h3 className="text-xl font-semibold text-white">Modern comfort</h3>
            <p className="mt-3 text-sm text-slate-300">Calm interiors, all-day service, and refined details that elevate every moment.</p>
          </div>
          <div className="card-surface overflow-hidden p-5">
            <div className="mb-4 text-3xl text-resort-200">03</div>
            <h3 className="text-xl font-semibold text-white">Culinary artistry</h3>
            <p className="mt-3 text-sm text-slate-300">Fresh coastal cuisine, handcrafted cocktails, and memorable dinners by the water.</p>
          </div>
          <div className="card-surface overflow-hidden p-5">
            <div className="mb-4 text-3xl text-resort-200">04</div>
            <h3 className="text-xl font-semibold text-white">Wellness focus</h3>
            <p className="mt-3 text-sm text-slate-300">Tailored treatments and restorative programs built around mindful living.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
