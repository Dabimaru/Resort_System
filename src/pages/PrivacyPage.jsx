import { Link } from 'react-router-dom';

export default function PrivacyPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="section-shell py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-heading-xl font-semibold text-text-primary">Privacy Notice</h1>
            <p className="mt-2 text-body-lg text-text-secondary">Last updated: November 2026</p>
          </div>

          <div className="card-surface-elevated p-8 space-y-6">
            <section>
              <h2 className="text-heading-md text-text-primary">1. Information We Collect</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We collect information you provide directly to us, including:
              </p>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Personal identification information (name, email, phone, address)</li>
                <li>Payment information (processed securely by our payment partners)</li>
                <li>Booking preferences and stay history</li>
                <li>Communication preferences and feedback</li>
                <li>Information from loyalty program enrollment</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">2. How We Use Your Information</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We use the information we collect for:
              </p>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Processing and managing reservations</li>
                <li>Providing personalized guest services</li>
                <li>Communicating about your bookings and stay</li>
                <li>Improving our website and services</li>
                <li>Sending promotional offers (with your consent)</li>
                <li>Complying with legal obligations</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">3. Information Sharing</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We do not sell your personal information. We may share information with:
              </p>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Service providers who assist with our operations</li>
                <li>Payment processors for transaction completion</li>
                <li>Legal authorities when required by law</li>
                <li>Business partners with your explicit consent</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">4. Data Security</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We implement appropriate technical and organizational measures to protect your personal information against unauthorized access, alteration, disclosure, or destruction. However, no method of transmission over the Internet is 100% secure.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">5. Data Retention</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We retain your personal information only for as long as necessary to fulfill the purposes outlined in this notice, including for legal, accounting, or reporting requirements.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">6. Your Rights</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Depending on your location, you may have the right to:
              </p>
              <ul className="mt-3 space-y-2 text-body-md text-text-secondary list-disc list-inside">
                <li>Access your personal information</li>
                <li>Request correction of inaccurate data</li>
                <li>Request deletion of your data</li>
                <li>Object to or restrict processing</li>
                <li>Data portability</li>
                <li>Withdraw consent at any time</li>
              </ul>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">7. Cookies and Tracking</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Our website uses cookies and similar technologies to enhance your experience, analyze traffic, and personalize content. You can manage cookie preferences through your browser settings.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">8. Third-Party Links</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Our website may contain links to third-party websites. We are not responsible for the privacy practices or content of these external sites. We encourage you to review their privacy policies.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">9. Children's Privacy</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Our services are not directed to children under 13. We do not knowingly collect personal information from children under 13. If you believe we have collected such information, please contact us immediately.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">10. Changes to This Notice</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We may update this Privacy Notice from time to time. We will notify you of any changes by posting the new notice on this page with an updated effective date.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">11. Contact Us</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                If you have questions about this Privacy Notice or our data practices, please contact our Data Protection Officer:
              </p>
              <address className="mt-2 not-italic text-body-md text-text-secondary">
                Azure Cove Resort<br />
                17 Shoreline Point, Riviera Bay, CA<br />
                Email: privacy@azurecove.com<br />
                Phone: +1 (800) 555-0148
              </address>
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