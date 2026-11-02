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
    <section id="contact" className="py-24">
      <div className="section-shell grid gap-10 lg:grid-cols-[0.9fr_1.1fr]">
        <div>
          <span className="inline-flex rounded-full border border-white/10 bg-white/5 px-4 py-2 text-xs font-medium uppercase tracking-[0.2em] text-slate-200">
            Contact
          </span>
          <h2 className="mt-6 text-4xl font-semibold tracking-tight text-white md:text-5xl">Let’s plan your stay.</h2>
          <div className="mt-8 space-y-5 text-slate-300">
            <p>{resortData.contact.email}</p>
            <p>{resortData.contact.phone}</p>
            <p>{resortData.contact.address}</p>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="rounded-[2rem] border border-white/10 bg-slate-900/70 p-6">
          <div className="grid gap-5 md:grid-cols-2">
            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Name</span>
              <input
                type="text"
                name="name"
                value={form.name}
                onChange={handleChange}
                placeholder="Your name"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-resort-400"
              />
            </label>
            <label className="block text-sm text-slate-200">
              <span className="mb-2 block">Email</span>
              <input
                type="email"
                name="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-resort-400"
              />
            </label>
          </div>
          <label className="mt-5 block text-sm text-slate-200">
            <span className="mb-2 block">Message</span>
            <textarea
              rows="5"
              name="message"
              value={form.message}
              onChange={handleChange}
              placeholder="Tell us about your ideal stay"
              className="w-full rounded-xl border border-white/10 bg-slate-950 px-3 py-3 text-white outline-none transition focus:border-resort-400"
            />
          </label>
          <button
            type="submit"
            disabled={loading}
            className="mt-6 rounded-full bg-resort-500 px-5 py-3 font-semibold text-slate-950 transition hover:bg-resort-400 disabled:cursor-not-allowed disabled:opacity-70"
          >
            {loading ? 'Sending...' : 'Send inquiry'}
          </button>

          {status.message ? (
            <p className={`mt-4 text-sm ${status.type === 'success' ? 'text-emerald-300' : 'text-red-300'}`}>
              {status.message}
            </p>
          ) : null}
        </form>
      </div>
    </section>
  );
}
