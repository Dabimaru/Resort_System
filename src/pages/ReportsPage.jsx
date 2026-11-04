import { useEffect, useState } from 'react';
import { getDashboardMetrics, getReportSummary } from '../services/api';

export default function ReportsPage() {
  const [report, setReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    const token = localStorage.getItem('azureCoveToken');

    const loadReport = async () => {
      try {
        const dashboard = await getDashboardMetrics(token);
        if (!dashboard?.metrics) {
          throw new Error('No dashboard metrics were returned.');
        }

        const payload = await getReportSummary(token);
        setReport(payload.report);
      } catch (loadError) {
        setError(loadError.message || 'Unable to load report data.');
      } finally {
        setLoading(false);
      }
    };

    loadReport();
  }, []);

  if (loading) {
    return <div className="min-h-screen bg-surface px-4 py-20 text-center text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-surface px-4 py-20 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
        <div className="section-shell card-surface-elevated p-8 border-l-4 border-state-error">
          <h1 className="text-heading-xl">Reports unavailable</h1>
          <p className="mt-3 text-state-error">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-surface px-4 py-12 text-text-primary dark:bg-dark-surface dark:text-dark-text-primary">
      <div className="section-shell space-y-8">
        <div>
          <span className="badge badge-info">Performance analytics</span>
          <h1 className="mt-4 text-heading-xl">Resort reporting dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total reservations', report?.totalReservations ?? 0],
            ['Confirmed', report?.confirmedReservations ?? 0],
            ['Cancelled', report?.cancelledReservations ?? 0],
            ['Revenue', `$${(report?.totalRevenue ?? 0).toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label} className="card-surface-elevated p-5">
              <p className="text-sm text-text-muted dark:text-dark-text-muted">{label}</p>
              <p className="mt-3 text-3xl font-semibold text-text-primary dark:text-dark-text-primary">{value}</p>
            </div>
          ))}
        </div>

        <div className="card-surface-elevated p-6">
          <h2 className="text-heading-lg">Revenue by room</h2>
          <div className="mt-6 space-y-3">
            {(report?.revenueByRoom || []).map((entry) => (
              <div key={entry.roomId} className="flex items-center justify-between rounded-2xl border border-border bg-surface p-4 dark:border-dark-border dark:bg-dark-surface">
                <span className="text-text-primary dark:text-dark-text-primary">{entry.roomName}</span>
                <span className="text-resort-600 dark:text-resort-400">${entry.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}