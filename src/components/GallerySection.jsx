import { resortData } from '../data/resortData';

export default function GallerySection() {
  return (
    <section id="gallery" className="py-24 bg-surface dark:bg-dark-surface">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-resort-600 dark:border-resort-500/30 dark:bg-resort-500/20 dark:text-resort-400">
            Gallery
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary dark:text-dark-text-primary md:text-5xl">A view worth lingering over.</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {resortData.gallery.map((image, index) => (
            <div
              key={image}
              className={`overflow-hidden rounded-[1.5rem] border border-border ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''} dark:border-dark-border`}
            >
              <img
                src={image}
                alt={`Resort view ${index + 1}`}
                className={`w-full object-cover ${index === 0 ? 'h-[420px] md:h-[500px]' : 'h-60'}`}
              />
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}