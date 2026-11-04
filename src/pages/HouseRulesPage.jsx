import { Link } from 'react-router-dom';

export default function HouseRulesPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="section-shell py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-heading-xl font-semibold text-text-primary">House Rules</h1>
            <p className="mt-2 text-body-lg text-text-secondary">Guidelines for a pleasant stay</p>
          </div>

          <div className="card-surface-elevated p-8 space-y-6">
            <section>
              <h2 className="text-heading-md text-text-primary">Check-in & Check-out</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Check-in: 2:00 PM onwards</li>
                <li>Check-out: 12:00 PM (noon)</li>
                <li>Early check-in / late check-out subject to availability and additional charges</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Quiet Hours</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Quiet hours observed from 10:00 PM to 7:00 AM daily</li>
                <li>Please keep noise levels to a minimum during these hours</li>
                <li>Pool area closes at 10:00 PM</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Smoking Policy</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>All indoor areas are strictly non-smoking</li>
                <li>Designated outdoor smoking areas are available</li>
                <li>A cleaning fee of PHP 5,000 applies for smoking in non-designated areas</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Pets</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Pets are welcome in designated pet-friendly rooms only</li>
                <li>Advance notice required at time of booking</li>
                <li>Pet fee: PHP 1,500 per night per pet</li>
                <li>Maximum 2 pets per room, each under 25kg</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Pool & Spa Rules</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Pool hours: 6:00 AM – 10:00 PM</li>
                <li>Children under 12 must be accompanied by an adult</li>
                <li>No diving, running, or glass containers in pool area</li>
                <li>Spa treatments require advance reservation</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Dining & Room Service</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Breakfast: 6:30 AM – 10:30 AM</li>
                <li>Room service available 6:00 AM – 11:00 PM</li>
                <li>Outside food and beverages not permitted in dining venues</li>
                <li>Dress code: Smart casual for dinner venues</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Property & Amenities</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Please do not remove resort property from rooms</li>
                <li>Towel cards required for pool/beach towel service</li>
                <li>Water sports equipment available at the beach desk</li>
                <li>Gym access: 24/7 with room key card</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Safety & Security</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Use in-room safe for valuables</li>
                <li>Do not leave balcony doors open when unattended</li>
                <li>Report any safety concerns to front desk immediately</li>
                <li>Emergency exits marked on each floor</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">Children & Families</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Children under 12 stay free with existing bedding</li>
                <li>Babysitting services available with 24-hour notice</li>
                <li>Kids club: 9:00 AM – 5:00 PM (ages 4-12)</li>
                <li>High chairs and cribs available upon request</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">General</h2>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Maximum occupancy per room must not be exceeded</li>
                <li>Parties and events require prior management approval</li>
                <li>Drone usage prohibited on resort property</li>
                <li>Management reserves the right to amend rules as needed</li>
              </ul>
            </section>
          </div>

          <div className="text-center">
            <Link to="/" className="btn-primary">Back to Home</Link>
          </div>
        </div>
      </div>
    </div>
  );
}