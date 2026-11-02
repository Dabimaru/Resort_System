import { NavLink } from 'react-router-dom';

const navItems = [
  { label: 'Overview', to: '/admin/dashboard', permission: 'reports.view' },
  { label: 'Staff', to: '/admin/staff', permission: 'staff.view' },
  { label: 'Roles', to: '/admin/roles', permission: 'roles.view' },
  { label: 'Permissions', to: '/admin/permissions', permission: 'roles.view' },
  { label: 'Bookings', to: '/admin/bookings', permission: 'bookings.view' },
  { label: 'Rooms', to: '/admin/rooms', permission: 'rooms.view' },
  { label: 'Inquiries', to: '/admin/inquiries', permission: 'inquiries.view' },
  { label: 'Chat support', to: '/admin/chat', permission: 'chat.view' },
  { label: 'Reports', to: '/admin/reports', permission: 'reports.view' },
  { label: 'Settings', to: '/admin/settings', permission: 'settings.view' },
  { label: 'Profile', to: '/admin/profile', permission: 'settings.view' },
];

export default function AdminSidebar({ user, permissions }) {
  const visibleItems = navItems.filter((item) => {
    if (!item.permission) return true;
    return permissions.has(item.permission) || permissions.has('all');
  });

  return (
    <aside className="w-full max-w-xs rounded-3xl border border-white/10 bg-slate-900/80 p-4 text-slate-200 md:w-72">
      <div className="mb-6 flex items-center gap-3 border-b border-white/10 pb-4">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-resort-500/20 text-lg font-semibold text-resort-200">
          AC
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Resort</p>
          <h2 className="text-lg font-semibold text-white">Admin Suite</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                isActive ? 'bg-resort-500 text-slate-950 font-semibold' : 'text-slate-300 hover:bg-white/5 hover:text-white'
              }`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-white/10 bg-slate-950/60 p-3">
        <p className="text-xs uppercase tracking-[0.2em] text-slate-400">Signed in</p>
        <p className="mt-2 font-medium text-white">{user?.name || 'Administrator'}</p>
        <p className="text-sm text-slate-400">{user?.role || 'admin'}</p>
      </div>
    </aside>
  );
}
