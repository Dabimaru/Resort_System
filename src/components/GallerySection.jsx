import { resortData } from '../data/resortData';

export default function GallerySection() {
  return (
    <section id="dining" className="bg-slate-950 py-24">
      <div className="section-shell">
        <div className="max-w-2xl">
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
            Gallery
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">A view worth lingering over.</h2>
        </div>

        <div className="mt-12 grid gap-5 md:grid-cols-2 xl:grid-cols-4">
          {resortData.gallery.map((image, index) => (
            <div
              key={image}
              className={`overflow-hidden rounded-[1.5rem] border border-white/10 ${index === 0 ? 'md:col-span-2 md:row-span-2' : ''}`}
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
