import { resortData } from '../data/resortData';

export default function TestimonialsSection() {
  return (
    <section id="reviews" className="bg-[#efeee7] py-20 dark:bg-dark-surface-elevated md:py-28">
      <div className="section-shell">
        <div className="mx-auto max-w-3xl text-center">
          <p className="section-kicker">Words from our guests</p>
          <h2 className="section-title">Some stays stay with you.</h2>
        </div>

        <div className="mt-12 grid gap-8 md:grid-cols-3 md:gap-0">
          {resortData.testimonials.map((testimonial, index) => (
            <figure key={testimonial.name} className={`flex flex-col px-0 py-6 md:px-8 md:py-4 ${index > 0 ? 'border-t border-border md:border-l md:border-t-0 dark:border-dark-border' : ''}`}>
              <div className="mb-5 text-sm tracking-[0.18em] text-[#a17d4b]" aria-label="5 out of 5 stars">★★★★★</div>
              <blockquote className="flex-1 font-display text-2xl leading-snug text-text-primary dark:text-dark-text-primary md:text-[1.7rem]">
                “{testimonial.quote}”
              </blockquote>
              <figcaption className="mt-7 flex items-center gap-3 border-t border-border pt-4 dark:border-dark-border">
                <span className="flex h-9 w-9 items-center justify-center rounded-full bg-resort-100 font-display text-lg font-semibold text-resort-800 dark:bg-resort-900 dark:text-resort-100" aria-hidden="true">
                  {testimonial.name.charAt(0)}
                </span>
                <span className="text-sm font-semibold text-text-primary dark:text-dark-text-primary">{testimonial.name}</span>
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
