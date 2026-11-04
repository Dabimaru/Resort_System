import PolicyLayout from '../components/PolicyLayout';

const sections = [
  {
    id: 'acceptance',
    title: 'Acceptance of Terms',
    paragraphs: [
      "By accessing and using Azure Cove Resort's website, booking systems, and on-property services, you accept and agree to be bound by these Terms and Conditions. If you do not agree with any part of these terms, please do not use our services.",
    ],
  },
  {
    id: 'reservations',
    title: 'Reservations and Bookings',
    paragraphs: [
      'All reservations are subject to availability and confirmation. A valid deposit or payment guarantee is required to secure every booking.',
    ],
    bullets: [
      'Rates are quoted per room, per night, and are subject to change without prior notice.',
      'The guest named on the reservation must be at least 18 years of age.',
      'Promotional rates are subject to their own eligibility requirements and blackout dates.',
      'Special requests are accommodated where possible but cannot be guaranteed.',
    ],
  },
  {
    id: 'cancellation',
    title: 'Cancellation Policy',
    paragraphs: [
      'Cancellations made more than 72 hours before the arrival date are refunded in full. Cancellations within 72 hours of arrival are charged for the first night. No-shows are charged the full reservation amount.',
    ],
    bullets: [
      'Refunds are issued to the original payment method within 7 to 14 business days.',
      'Peak-season and holiday reservations may follow separate cancellation terms, disclosed at the time of booking.',
      'Amendments to dates are treated as a new reservation and are subject to availability.',
    ],
  },
  {
    id: 'checkin',
    title: 'Check-in and Check-out',
    paragraphs: [
      'Check-in begins at 2:00 PM and check-out is at 12:00 PM. Early check-in and late check-out are subject to availability and may incur additional charges.',
    ],
    bullets: [
      'A valid government-issued photo identification is required at check-in.',
      'A refundable incidental deposit may be held against your room account.',
      'Unregistered visitors are not permitted to stay overnight.',
    ],
  },
  {
    id: 'conduct',
    title: 'Guest Conduct',
    paragraphs: [
      'Guests are expected to behave in a manner that respects other guests, our team, and resort property. Management reserves the right to refuse service or end a stay where behaviour is disruptive, unsafe, or damaging.',
    ],
  },
  {
    id: 'liability',
    title: 'Limitation of Liability',
    paragraphs: [
      'Azure Cove Resort is not liable for indirect, incidental, or consequential losses arising from the use of our services, including loss of profits or data. Nothing in these terms limits liability that cannot lawfully be limited.',
    ],
    bullets: [
      'Guests are responsible for the safekeeping of personal belongings; in-room safes are provided.',
      'The resort is not responsible for loss or damage to vehicles parked on the premises.',
      'Activities such as water sports and excursions are undertaken at the guest\'s own risk.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to These Terms',
    paragraphs: [
      'We may update these terms from time to time. Changes take effect once posted on this page, and continued use of our services constitutes acceptance of the revised terms.',
    ],
  },
  {
    id: 'law',
    title: 'Governing Law',
    paragraphs: [
      'These terms are governed by and construed in accordance with the laws of the Philippines, without regard to conflict of law provisions. Disputes are subject to the exclusive jurisdiction of the courts of that territory.',
    ],
  },
];

export default function TermsPage() {
  return (
    <PolicyLayout
      badge="Legal"
      title="Terms and Conditions"
      subtitle="The agreement that governs your use of our website, booking platform, and resort services."
      lastUpdated="November 2026"
      sections={sections}
    />
  );
}