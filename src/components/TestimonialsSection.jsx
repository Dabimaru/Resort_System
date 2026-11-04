import { resortData } from '../data/resortData';

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="py-24 bg-surface dark:bg-dark-surface">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-resort-600 dark:border-resort-500/30 dark:bg-resort-500/20 dark:text-resort-400">
            Guest reviews
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary dark:text-dark-text-primary md:text-5xl">Loved by guests seeking stillness.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {resortData.testimonials.map((testimonial) => (
            <div key={testimonial.name} className="card-surface p-6">
              <div className="mb-5 flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={`${testimonial.name}-${idx}`}>★</span>
                ))}
              </div>
              <p className="text-lg leading-8 text-text-secondary dark:text-dark-text-secondary">"{testimonial.quote}"</p>
              <div className="mt-6 border-t border-border pt-4 text-sm font-medium text-text-primary dark:border-dark-border dark:text-dark-text-primary">{testimonial.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}