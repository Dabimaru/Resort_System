import { Link } from 'react-router-dom';

export default function TermsPage() {
  return (
    <div className="min-h-screen bg-surface text-text-primary">
      <div className="section-shell py-16">
        <div className="max-w-3xl mx-auto space-y-8">
          <div className="text-center">
            <h1 className="text-heading-xl font-semibold text-text-primary">Terms and Conditions</h1>
            <p className="mt-2 text-body-lg text-text-secondary">Last updated: November 2026</p>
          </div>

          <div className="card-surface-elevated p-8 space-y-6">
            <section>
              <h2 className="text-heading-md text-text-primary">1. Acceptance of Terms</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                By accessing and using Azure Cove Resort's website and services, you accept and agree to be bound by the terms and provision of this agreement. If you do not agree to abide by the above, please do not use this service.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">2. Reservations and Bookings</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                All reservations are subject to availability. Rates are quoted in PHP and are subject to change without prior notice. A valid credit card or deposit is required to guarantee all reservations.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">3. Cancellation Policy</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Cancellations made more than 72 hours prior to arrival date will receive a full refund. Cancellations within 72 hours will be charged for the first night's stay. No-shows will be charged the full reservation amount.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">4. Check-in and Check-out</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Check-in time is 2:00 PM and check-out time is 12:00 PM. Early check-in and late check-out are subject to availability and may incur additional charges.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">5. Guest Conduct</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Guests are expected to conduct themselves in a manner that respects other guests and resort property. The management reserves the right to refuse service or ask guests to leave if their behavior is disruptive or damaging.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">6. Limitation of Liability</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                Azure Cove Resort shall not be liable for any direct, indirect, incidental, or consequential damages resulting from the use or inability to use our services, including but not limited to loss of data or profits.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">7. Changes to Terms</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                We reserve the right to modify these terms at any time. Changes will be effective immediately upon posting to this page. Your continued use of our services constitutes acceptance of the modified terms.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">8. Governing Law</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                These terms shall be governed by and construed in accordance with the laws of the Philippines, without regard to its conflict of law provisions.
              </p>
            </section>

            <section>
              <h2 className="text-heading-md text-text-primary">9. Contact Information</h2>
              <p className="mt-2 text-body-md text-text-secondary">
                If you have any questions about these Terms and Conditions, please contact us at:
              </p>
              <address className="mt-2 not-italic text-body-md text-text-secondary">
                Azure Cove Resort<br />
                17 Shoreline Point, Riviera Bay, CA<br />
                Email: stay@azurecove.com<br />
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