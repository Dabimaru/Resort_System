import { Link } from 'react-router-dom';
import { resortData } from '../data/resortData';

export default function PolicyLayout({ badge = 'Policy', title, subtitle, lastUpdated, sections = [] }) {
  const contact = resortData.contact || {};

  return (
    <div className="min-h-screen bg-surface dark:bg-dark-surface">
      <div className="border-b border-border bg-surface-elevated dark:border-dark-border dark:bg-dark-surface-elevated">
        <div className="section-shell py-14 lg:py-20">
          <nav
            aria-label="Breadcrumb"
            className="flex items-center gap-2 text-caption text-text-muted dark:text-dark-text-muted"
          >
            <Link to="/" className="transition hover:text-resort-600 dark:hover:text-resort-400">Home</Link>
            <span aria-hidden="true">/</span>
            <span className="text-text-secondary dark:text-dark-text-secondary">{title}</span>
          </nav>

          <span className="badge badge-primary mt-6">{badge}</span>
          <h1 className="text-display-sm mt-5">{title}</h1>
          {subtitle ? (
            <p className="mt-4 max-w-2xl text-body-lg text-text-secondary dark:text-dark-text-secondary">{subtitle}</p>
          ) : null}
          {lastUpdated ? (
            <p className="mt-5 text-body-sm text-text-muted dark:text-dark-text-muted">Last updated: {lastUpdated}</p>
          ) : null}
        </div>
      </div>

      <div className="section-shell py-12 lg:py-16">
        <div className="grid gap-10 lg:grid-cols-[16rem_minmax(0,1fr)] lg:gap-14">
          <aside className="lg:sticky lg:top-24 lg:self-start">
            <div className="card-surface-elevated p-5">
              <p className="text-caption text-text-muted dark:text-dark-text-muted">On this page</p>
              <nav className="mt-4 space-y-2.5">
                {sections.map((section, index) => (
                  <a
                    key={section.id}
                    href={`#${section.id}`}
                    className="block text-body-sm text-text-secondary transition hover:text-resort-600 dark:text-dark-text-secondary dark:hover:text-resort-400"
                  >
                    {index + 1}. {section.title}
                  </a>
                ))}
              </nav>
            </div>
          </aside>

          <div className="space-y-6">
            {sections.map((section, index) => (
              <section
                key={section.id}
                id={section.id}
                className="card-surface-elevated scroll-mt-24 p-6 md:p-8"
              >
                <div className="flex items-start gap-4">
                  <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-resort-500/10 text-sm font-semibold text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">
                    {index + 1}
                  </span>
                  <h2 className="text-heading-md">{section.title}</h2>
                </div>

                {(section.paragraphs || []).map((paragraph) => (
                  <p key={paragraph} className="mt-4 text-body-md text-text-secondary dark:text-dark-text-secondary">
                    {paragraph}
                  </p>
                ))}

                {section.bullets && section.bullets.length > 0 ? (
                  <ul className="mt-5 space-y-2.5">
                    {section.bullets.map((bullet) => (
                      <li key={bullet} className="flex gap-3 text-body-md text-text-secondary dark:text-dark-text-secondary">
                        <span className="mt-2.5 h-1.5 w-1.5 shrink-0 rounded-full bg-resort-500" />
                        <span>{bullet}</span>
                      </li>
                    ))}
                  </ul>
                ) : null}
              </section>
            ))}

            <div className="rounded-2xl border border-resort-500/25 bg-resort-500/5 p-6 dark:border-resort-500/30 dark:bg-resort-500/10">
              <h2 className="text-heading-sm">Questions about this policy?</h2>
              <p className="mt-2 text-body-sm text-text-secondary dark:text-dark-text-secondary">
                Our guest services team is happy to clarify anything on this page.
              </p>
              <div className="mt-4 flex flex-wrap gap-x-8 gap-y-2 text-body-sm">
                <a href={`mailto:${contact.email}`} className="text-link">{contact.email}</a>
                <a href={`tel:${String(contact.phone || '').replace(/\D/g, '')}`} className="text-link">{contact.phone}</a>
              </div>
              <p className="mt-3 text-body-sm text-text-muted dark:text-dark-text-muted">{contact.address}</p>
            </div>

            <div className="flex flex-wrap items-center gap-3 pt-2">
              <Link to="/" className="btn-primary">Back to home</Link>
              <Link to="/house-rules" className="btn-outline">House rules</Link>
              <Link to="/privacy" className="btn-outline">Privacy notice</Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}