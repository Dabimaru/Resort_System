import { resortData } from '../data/resortData';

export default function TestimonialsSection() {
  return (
    <section id="wellness" className="py-24">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
            Guest reviews
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">Loved by guests seeking stillness.</h2>
        </div>

        <div className="mt-12 grid gap-6 md:grid-cols-3">
          {resortData.testimonials.map((testimonial) => (
            <div key={testimonial.name} className="card-surface p-6">
              <div className="mb-5 flex items-center gap-1 text-yellow-400">
                {Array.from({ length: 5 }).map((_, idx) => (
                  <span key={`${testimonial.name}-${idx}`}>★</span>
                ))}
              </div>
              <p className="text-lg leading-8 text-slate-200">“{testimonial.quote}”</p>
              <div className="mt-6 border-t border-white/10 pt-4 text-sm font-medium text-white">{testimonial.name}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
