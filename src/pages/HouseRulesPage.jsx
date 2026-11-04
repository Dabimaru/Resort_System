import PolicyLayout from '../components/PolicyLayout';

const sections = [
  {
    id: 'checkin',
    title: 'Check-in & Check-out',
    paragraphs: [
      'A smooth arrival and departure helps every guest enjoy their stay. Please plan around the following times.',
    ],
    bullets: [
      'Check-in: 2:00 PM onwards',
      'Check-out: 12:00 PM (noon)',
      'Early check-in and late check-out are subject to availability and additional charges',
      'Late check-out beyond 6:00 PM is charged as a full night',
    ],
  },
  {
    id: 'quiet',
    title: 'Quiet Hours',
    paragraphs: [
      'To protect the calm of the cove, quiet hours are observed across the property each night.',
    ],
    bullets: [
      'Quiet hours run from 10:00 PM to 7:00 AM daily',
      'Please keep televisions, music, and conversation at a considerate volume',
      'The pool deck closes at 10:00 PM',
      'Repeated disturbances may result in a request to vacate the premises',
    ],
  },
  {
    id: 'smoking',
    title: 'Smoking Policy',
    paragraphs: [
      'All indoor areas of the resort are strictly non-smoking, including rooms, balconies, and enclosed dining spaces.',
    ],
    bullets: [
      'Designated outdoor smoking areas are available and marked on the property map',
      'A cleaning fee of PHP 5,000 applies for smoking in non-designated areas',
      'Electronic cigarettes and vapes follow the same policy as conventional smoking',
    ],
  },
  {
    id: 'pets',
    title: 'Pets',
    paragraphs: [
      'We welcome well-behaved pets in our designated pet-friendly rooms with advance notice.',
    ],
    bullets: [
      'Advance notice is required at the time of booking',
      'Pet fee: PHP 1,500 per night, per pet',
      'Maximum of 2 pets per room, each under 25 kg',
      'Pets must be leashed in all public areas and are not permitted in dining venues or the pool',
    ],
  },
  {
    id: 'pool',
    title: 'Pool & Spa',
    paragraphs: [
      'Our infinity pool and spa are open to registered guests throughout the day.',
    ],
    bullets: [
      'Pool hours: 6:00 AM to 10:00 PM',
      'Children under 12 must be accompanied by an adult at all times',
      'No diving, running, or glass containers in the pool area',
      'Spa treatments require advance reservation',
      'Pool and beach towels are issued against a towel card from your room',
    ],
  },
  {
    id: 'dining',
    title: 'Dining & Room Service',
    paragraphs: [
      'Our restaurants and in-room dining serve locally sourced coastal cuisine throughout the day.',
    ],
    bullets: [
      'Breakfast: 6:30 AM to 10:30 AM',
      'Room service: 6:00 AM to 11:00 PM',
      'Outside food and beverages are not permitted in dining venues',
      'Dress code for dinner venues is smart casual',
    ],
  },
  {
    id: 'property',
    title: 'Property & Amenities',
    paragraphs: [
      'Please help us keep the resort in excellent condition for every guest who follows.',
    ],
    bullets: [
      'Resort property and linens should remain in your room',
      'Water sports equipment is available from the beach desk',
      'The fitness centre is accessible 24/7 with your room key card',
      'Damages beyond normal wear may be charged to your room account',
    ],
  },
  {
    id: 'safety',
    title: 'Safety & Security',
    paragraphs: [
      'Your safety is our priority. Please take a moment to note the following.',
    ],
    bullets: [
      'Use the in-room safe for passports, jewellery, and valuables',
      'Do not leave balcony doors open when the room is unattended',
      'Report any safety concern to the front desk immediately',
      'Emergency exits are marked on every floor and in every room',
    ],
  },
  {
    id: 'children',
    title: 'Children & Families',
    paragraphs: [
      'Families are warmly welcome, and we offer services designed around younger guests.',
    ],
    bullets: [
      'Children under 12 stay free when using existing bedding',
      'Babysitting services are available with 24 hours notice',
      'Kids club runs 9:00 AM to 5:00 PM for ages 4 to 12',
      'High chairs and cribs are available on request at no extra charge',
    ],
  },
  {
    id: 'general',
    title: 'General',
    paragraphs: [
      'A few final points that apply across the property.',
    ],
    bullets: [
      'Maximum occupancy per room must not be exceeded',
      'Parties and events require prior approval from management',
      'Drone usage is prohibited on resort property',
      'Management reserves the right to amend these rules as needed',
    ],
  },
];

export default function HouseRulesPage() {
  return (
    <PolicyLayout
      badge="Guest guide"
      title="House Rules"
      subtitle="A short guide to the times, courtesies, and guidelines that keep Azure Cove comfortable for everyone."
      lastUpdated="November 2026"
      sections={sections}
    />
  );
}