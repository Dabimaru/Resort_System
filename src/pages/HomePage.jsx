import HeroSection from '../components/HeroSection';
import AboutSection from '../components/AboutSection';
import RoomShowcase from '../components/RoomShowcase';
import AmenitiesSection from '../components/AmenitiesSection';
import GallerySection from '../components/GallerySection';
import TestimonialsSection from '../components/TestimonialsSection';
import BookingForm from '../components/BookingForm';
import ContactSection from '../components/ContactSection';

export default function HomePage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <main>
        <HeroSection />
        <AboutSection />
        <RoomShowcase />
        <AmenitiesSection />
        <GallerySection />
        <TestimonialsSection />
        <section id="booking" className="bg-surface-elevated/50 py-24 dark:bg-dark-surface-elevated/50">
          <div className="section-shell grid items-center gap-8 lg:grid-cols-[0.9fr_1.1fr]">
            <div>
              <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-resort-600 dark:border-resort-500/30 dark:bg-resort-500/20 dark:text-resort-400">
                Experience more
              </span>
              <h2 className="mt-6 text-4xl font-semibold tracking-tight text-text-primary dark:text-dark-text-primary md:text-5xl">The kind of getaway that stays with you.</h2>
              <p className="mt-5 max-w-xl text-lg text-text-secondary dark:text-dark-text-secondary">
                Unwind in elegant suites, recharge with mindful spa rituals, and let every detail be thoughtfully handled by our dedicated team.
              </p>
            </div>
            <BookingForm />
          </div>
        </section>
        <ContactSection />
      </main>
    </div>
  );
}