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
    return <div className="min-h-screen bg-slate-950 px-4 py-20 text-center text-white">Loading reports...</div>;
  }

  if (error) {
    return (
      <div className="min-h-screen bg-slate-950 px-4 py-20 text-white">
        <div className="section-shell rounded-3xl border border-red-500/30 bg-red-500/10 p-8">
          <h1 className="text-3xl font-semibold">Reports unavailable</h1>
          <p className="mt-3 text-red-100">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 px-4 py-12 text-white">
      <div className="section-shell space-y-8">
        <div>
          <span className="inline-flex rounded-full border border-resort-500/30 bg-resort-500/10 px-3 py-1 text-xs uppercase tracking-[0.2em] text-resort-200">
            Performance analytics
          </span>
          <h1 className="mt-4 text-4xl font-semibold">Resort reporting dashboard</h1>
        </div>

        <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-4">
          {[
            ['Total reservations', report?.totalReservations ?? 0],
            ['Confirmed', report?.confirmedReservations ?? 0],
            ['Cancelled', report?.cancelledReservations ?? 0],
            ['Revenue', `$${(report?.totalRevenue ?? 0).toLocaleString()}`],
          ].map(([label, value]) => (
            <div key={label} className="rounded-2xl border border-white/10 bg-slate-900/80 p-5">
              <p className="text-sm text-slate-400">{label}</p>
              <p className="mt-3 text-3xl font-semibold">{value}</p>
            </div>
          ))}
        </div>

        <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-6">
          <h2 className="text-2xl font-semibold">Revenue by room</h2>
          <div className="mt-6 space-y-3">
            {(report?.revenueByRoom || []).map((entry) => (
              <div key={entry.roomId} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-4">
                <span>{entry.roomName}</span>
                <span className="text-resort-200">${entry.revenue.toLocaleString()}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
