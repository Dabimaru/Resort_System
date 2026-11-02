export default function AdminHeader({ user, onSignOut }) {
  return (
    <header className="flex items-center justify-between rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-white">
      <div>
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Management portal</p>
        <h1 className="mt-1 text-2xl font-semibold">Resort operations</h1>
      </div>

      <div className="flex items-center gap-3">
        <button type="button" className="rounded-full border border-white/10 bg-white/5 px-3 py-2 text-sm text-slate-200 hover:border-white/20">
          🔔 Alerts
        </button>
        <div className="flex items-center gap-3 rounded-full border border-white/10 bg-slate-950/60 px-3 py-2">
          <div className="flex h-9 w-9 items-center justify-center rounded-full bg-resort-500/20 text-sm font-semibold text-resort-200">
            {user?.name?.slice(0, 1).toUpperCase() || 'A'}
          </div>
          <div className="text-left">
            <p className="text-sm font-medium text-white">{user?.name || 'Admin'}</p>
            <p className="text-xs text-slate-400">{user?.role || 'super-admin'}</p>
          </div>
        </div>
        <button
          type="button"
          onClick={onSignOut}
          className="rounded-full border border-red-500/40 bg-red-500/10 px-3 py-2 text-sm text-red-200 hover:bg-red-500/20"
        >
          Sign out
        </button>
      </div>
    </header>
  );
}
