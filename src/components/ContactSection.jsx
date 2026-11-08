import { useState } from 'react';
import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';
import { submitInquiry } from '../services/api';

const initialForm = { name: '', email: '', message: '' };

export default function ContactSection() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setForm((current) => ({ ...current, [name]: value }));
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    setLoading(true);
    setStatus({ type: '', message: '' });

    try {
      const response = await submitInquiry(form);
      setStatus({ type: 'success', message: `${response.message} Reference: ${response.data.inquiryReference}` });
      setForm(initialForm);
    } catch (error) {
      setStatus({ type: 'error', message: error.message || 'Unable to send inquiry.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <section id="contact" className="bg-surface py-20 dark:bg-dark-surface md:py-28">
      <div className="section-shell grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:gap-20">
        <div>
          <p className="section-kicker">We are here to help</p>
          <h2 className="section-title">Let’s make it yours.</h2>
          <p className="section-description">
            Tell us what you have in mind. Our guest team will help shape a stay that feels just right.
          </p>

          <div className="mt-9 space-y-6 border-t border-border pt-6 dark:border-dark-border">
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted dark:text-dark-text-muted">Write to us</p>
              <a href={`mailto:${resortData.contact.email}`} className="mt-2 inline-block text-base font-medium text-text-primary hover:text-resort-700 dark:text-dark-text-primary dark:hover:text-resort-300">{resortData.contact.email}</a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted dark:text-dark-text-muted">Call our team</p>
              <a href={`tel:${resortData.contact.phone.replace(/\D/g, '')}`} className="mt-2 inline-block text-base font-medium text-text-primary hover:text-resort-700 dark:text-dark-text-primary dark:hover:text-resort-300">{resortData.contact.phone}</a>
            </div>
            <div>
              <p className="text-xs font-semibold uppercase tracking-[0.15em] text-text-muted dark:text-dark-text-muted">Find us</p>
              <p className="mt-2 text-base text-text-primary dark:text-dark-text-primary">{resortData.contact.address}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-md border border-border bg-surface-elevated p-6 dark:border-dark-border dark:bg-dark-surface-elevated md:p-8">
          <h3 className="font-display text-3xl font-semibold text-text-primary dark:text-dark-text-primary">Send an inquiry</h3>
          <p className="mt-2 text-sm text-text-secondary dark:text-dark-text-secondary">We’ll be in touch as soon as we can.</p>
          <div className="mt-7 grid gap-5 sm:grid-cols-2">
            <label className="form-group text-sm text-text-secondary dark:text-dark-text-secondary">
              <span>Your name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Full name"
                autoComplete="name"
                required
                className="form-input mt-2"
              />
            </label>
            <label className="form-group text-sm text-text-secondary dark:text-dark-text-secondary">
              <span>Email address</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
                className="form-input mt-2"
              />
            </label>
          </div>
          <label className="form-group mt-5 text-sm text-text-secondary dark:text-dark-text-secondary">
            <span>How can we help?</span>
            <textarea
              rows="5"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us a little about the stay you have in mind."
              required
              className="form-textarea mt-2"
            />
          </label>
          <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <button type="submit" disabled={loading} className="btn-primary min-w-40">
              {loading ? 'Sending…' : 'Send inquiry'}
            </button>
            <p className="text-xs text-text-muted dark:text-dark-text-muted">
              Prefer to browse? <Link to="/terms" className="underline underline-offset-2">Read our guest policies</Link>.
            </p>
          </div>
          {status.message ? (
            <p role="status" className={`mt-4 text-sm ${status.type === 'success' ? 'text-state-success' : 'text-state-error'}`}>
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
