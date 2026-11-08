import { Link } from 'react-router-dom';
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
        <section id="booking" className="scroll-mt-20 bg-[#efeee7] py-20 dark:bg-dark-surface-elevated md:py-28">
          <div className="section-shell grid items-start gap-10 lg:grid-cols-[0.85fr_1.15fr] lg:gap-16">
            <div className="lg:sticky lg:top-32">
              <p className="section-kicker">Your time away starts here</p>
              <h2 className="section-title">Make room for a little more.</h2>
              <p className="section-description">
                Find the dates that feel right. We’ll take care of the details from there.
              </p>
              <p className="mt-7 border-l-2 border-resort-500 pl-4 text-sm leading-6 text-text-secondary dark:text-dark-text-secondary">
                Need a hand planning? Our team is happy to help.
                <Link to="/#contact" className="ml-1 font-semibold text-resort-700 hover:underline dark:text-resort-300">Get in touch</Link>
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