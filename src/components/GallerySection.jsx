import { resortData } from '../data/resortData';

export default function GallerySection() {
  const imageLayout = [
    'md:col-span-7 md:row-span-2',
    'md:col-span-5',
    'md:col-span-5',
    'md:col-span-12',
  ];

  return (
    <section id="gallery" className="bg-surface py-20 dark:bg-dark-surface md:py-28">
      <div className="section-shell">
        <div className="mb-10 flex flex-col gap-5 md:mb-12 md:flex-row md:items-end md:justify-between">
          <div>
            <p className="section-kicker">A glimpse of the coast</p>
            <h2 className="section-title">Let the view do the talking.</h2>
          </div>
          <p className="max-w-sm text-sm leading-6 text-text-secondary dark:text-dark-text-secondary">
            Sunlit mornings, open water, and quiet corners made for taking your time.
          </p>
        </div>

        <div className="grid gap-3 md:grid-cols-12 md:grid-rows-[250px_250px_190px]">
          {resortData.gallery.map((image, index) => (
            <figure key={image} className={`group relative min-h-[220px] overflow-hidden rounded-sm bg-resort-900 ${imageLayout[index] || ''}`}>
              <img
                src={image}
                alt={`Azure Cove resort view ${index + 1}`}
                loading="lazy"
                className="absolute inset-0 h-full w-full object-cover transition duration-700 group-hover:scale-[1.035]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-[#0b211d]/45 via-transparent to-transparent opacity-70 transition group-hover:opacity-100" />
              <span className="absolute bottom-4 left-4 text-xs font-medium uppercase tracking-[0.16em] text-white/90">
                {['The shoreline', 'Island light', 'By the water', 'A change of pace'][index] || 'Azure Cove'}
              </span>
            </figure>
          ))}
        </div>
      </div>
    </section>
  );
}
