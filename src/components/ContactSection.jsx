import { useState } from 'react';
import { resortData } from '../data/resortData';
import { submitInquiry } from '../services/api';

const initialForm = {
  name: '',
  email: '',
  message: '',
};

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
    <section id="contact" className="py-24 bg-surface">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="badge badge-neutral">Contact</span>
          <h2 className="mt-6 text-display-sm font-semibold tracking-tight text-text-primary md:text-display-md">Let&apos;s plan your stay.</h2>
          <div className="mt-8 space-y-5 text-text-secondary">
            <p>{resortData.contact.email}</p>
            <p>{resortData.contact.phone}</p>
            <p>{resortData.contact.address}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="card-surface-elevated p-6 rounded-3xl">
          <div className="grid gap-5 md:grid-cols-2">
            <div className="form-group">
              <label className="form-label" htmlFor="name">Name</label>
              <input
                type="text"
                id="name"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="form-input"
                required
              />
            </div>
            <div className="form-group">
              <label className="form-label" htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="form-input"
                required
              />
            </div>
          </div>
          <div className="form-group">
            <label className="form-label" htmlFor="message">Message</label>
            <textarea
              id="message"
              rows="5"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your ideal stay"
              className="form-textarea"
              required
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            className="btn-primary mt-6 w-full"
          >
            {loading ? 'Sending...' : 'Send inquiry'}
          </button>

          {status.message ? (
            <p className={`mt-4 text-body-sm ${status.type === 'success' ? 'text-state-success' : 'text-state-error'}`}>
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
