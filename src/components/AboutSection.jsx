export default function AboutSection() {
  return (
    <section id="about" className="py-24 bg-surface">
      <div className="section-shell grid items-center gap-10 lg:grid-cols-[1.05fr_0.95fr]">
        <div className="space-y-6">
          <span className="badge badge-info">About the resort</span>
          <h2 className="text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">
            Thoughtful luxury rooted in place.
          </h2>
          <p className="text-body-lg text-text-secondary">
            Azure Cove blends contemporary comfort with the natural rhythm of the coast — an intimate hideaway shaped by warm hospitality, restorative rituals, and breathtaking sea views.
          </p>
          <p className="text-text-muted">
            From our sunrise spa rituals and chef-led dining to curated island journeys, every stay is designed to feel elevated, effortless, and deeply personal.
          </p>
        </div>

        <div className="grid gap-5 sm:grid-cols-2">
          <div className="card-interactive p-5 overflow-hidden">
            <div className="mb-4 text-3xl text-resort-300">01</div>
            <h3 className="text-heading-md font-semibold text-text-primary">Immersive experiences</h3>
            <p className="mt-3 text-body-sm text-text-secondary">Private boat charters, guided snorkeling, and disappearing into the shoreline at golden hour.</p>
          </div>
          <div className="card-interactive p-5 overflow-hidden">
            <div className="mb-4 text-3xl text-resort-300">02</div>
            <h3 className="text-heading-md font-semibold text-text-primary">Modern comfort</h3>
            <p className="mt-3 text-body-sm text-text-secondary">Calm interiors, all-day service, and refined details that elevate every moment.</p>
          </div>
          <div className="card-interactive p-5 overflow-hidden">
            <div className="mb-4 text-3xl text-resort-300">03</div>
            <h3 className="text-heading-md font-semibold text-text-primary">Culinary artistry</h3>
            <p className="mt-3 text-body-sm text-text-secondary">Fresh coastal cuisine, handcrafted cocktails, and memorable dinners by the water.</p>
          </div>
          <div className="card-interactive p-5 overflow-hidden">
            <div className="mb-4 text-3xl text-resort-300">04</div>
            <h3 className="text-heading-md font-semibold text-text-primary">Wellness focus</h3>
            <p className="mt-3 text-body-sm text-text-secondary">Tailored treatments and restorative programs built around mindful living.</p>
          </div>
        </div>
      </div>
    </section>
  );
}
