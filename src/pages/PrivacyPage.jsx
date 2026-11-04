import PolicyLayout from '../components/PolicyLayout';

const sections = [
  {
    id: 'collect',
    title: 'Information We Collect',
    paragraphs: [
      'We collect information you provide directly to us when you browse, book, or stay with us.',
    ],
    bullets: [
      'Personal identification details such as name, email address, phone number, and postal address',
      'Payment information, processed securely by our payment partners',
      'Booking preferences, stay history, and special requests',
      'Communication preferences and feedback you share with us',
      'Loyalty programme enrolment details, where applicable',
    ],
  },
  {
    id: 'use',
    title: 'How We Use Your Information',
    paragraphs: [
      'Your information allows us to deliver and improve the service you receive.',
    ],
    bullets: [
      'Processing and managing reservations and payments',
      'Providing personalised guest services during your stay',
      'Communicating with you about your booking and any changes to it',
      'Improving our website, services, and guest experience',
      'Sending promotional offers, only where you have given consent',
      'Meeting legal, accounting, and regulatory obligations',
    ],
  },
  {
    id: 'sharing',
    title: 'Information Sharing',
    paragraphs: [
      'We do not sell your personal information. We share it only where necessary and with appropriate safeguards.',
    ],
    bullets: [
      'Service providers who support our operations, such as payment processors and booking platforms',
      'Legal authorities where we are required to do so by law',
      'Business partners, only with your explicit consent',
    ],
  },
  {
    id: 'security',
    title: 'Data Security',
    paragraphs: [
      'We apply technical and organisational measures designed to protect your personal information against unauthorised access, alteration, disclosure, or destruction. No method of transmission over the internet is completely secure, so we cannot guarantee absolute security.',
    ],
  },
  {
    id: 'retention',
    title: 'Data Retention',
    paragraphs: [
      'We keep personal information only for as long as necessary to fulfil the purposes described in this notice, including to satisfy legal, accounting, and reporting requirements. When it is no longer needed, we securely delete or anonymise it.',
    ],
  },
  {
    id: 'rights',
    title: 'Your Rights',
    paragraphs: [
      'Depending on where you live, you may have some or all of the following rights regarding your personal information.',
    ],
    bullets: [
      'Access the personal information we hold about you',
      'Request correction of inaccurate or incomplete data',
      'Request deletion of your personal information',
      'Object to or request restriction of certain processing',
      'Request portability of the data you provided to us',
      'Withdraw consent at any time, where processing is based on consent',
    ],
  },
  {
    id: 'cookies',
    title: 'Cookies and Tracking',
    paragraphs: [
      'Our website uses cookies and similar technologies to keep you signed in, remember preferences, analyse traffic, and personalise content. You can manage or disable cookies through your browser settings, though some parts of the site may not work as intended without them.',
    ],
  },
  {
    id: 'thirdparty',
    title: 'Third-Party Links',
    paragraphs: [
      'Our website may link to third-party sites, including social media platforms and mapping services. We are not responsible for the privacy practices or content of those sites and encourage you to review their policies before providing personal information.',
    ],
  },
  {
    id: 'children',
    title: "Children's Privacy",
    paragraphs: [
      'Our services are not directed to children under 13, and we do not knowingly collect personal information from them. If you believe a child has provided us with personal information, please contact us so we can remove it.',
    ],
  },
  {
    id: 'changes',
    title: 'Changes to This Notice',
    paragraphs: [
      'We may update this Privacy Notice from time to time. Any changes will be posted on this page with a revised effective date, and material changes will be highlighted where appropriate.',
    ],
  },
];

export default function PrivacyPage() {
  return (
    <PolicyLayout
      badge="Your data"
      title="Privacy Notice"
      subtitle="How Azure Cove Resort collects, uses, and protects the personal information you share with us."
      lastUpdated="November 2026"
      sections={sections}
    />
  );
}