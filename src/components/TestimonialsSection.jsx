import { resortData } from '../data/resortData';

export default function TestimonialsSection() {
  return (
    <section id="wellness" className="py-24 bg-surface">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="badge badge-neutral">Guest reviews</span>
          <h2 className="mt-6 text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">Loved by guests seeking stillness.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {resortData.testimonials.map((testimonial) => (
            <div key={testimonial.name} className="card-interactive p-6">
              <div className="mb-5 flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={`${testimonial.name}-${idx}`}>★</span>
                ))}
              </div>
              <p className="text-body-lg leading-8 text-text-primary">"{testimonial.quote}"</p>
              <div className="mt-6 border-t border-border pt-4 text-body-sm font-medium text-text-primary">{testimonial.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
