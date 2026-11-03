import { resortData } from '../data/resortData';

export default function GallerySection() {
  return (
    <section id="dining" className="py-24 bg-surface">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="badge badge-neutral">Gallery</span>
          <h2 className="mt-6 text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">A view worth lingering over.</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {resortData.gallery.map((image, index) => (
            <div
              key={image}
              className={`overflow-hidden rounded-2xl border border-border ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
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
