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
    <aside className="w-full max-w-xs rounded-3xl border border-border bg-surface-elevated p-4 text-text-secondary dark:border-dark-border dark:bg-dark-surface-elevated md:w-72">
      <div className="mb-6 flex items-center gap-3 border-b border-border pb-4 dark:border-dark-border">
        <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-resort-500/10 text-lg font-semibold text-resort-600 dark:bg-resort-500/20 dark:text-resort-400">
          AC
        </div>
        <div>
          <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Resort</p>
          <h2 className="text-lg font-semibold text-text-primary dark:text-dark-text-primary">Admin Suite</h2>
        </div>
      </div>

      <nav className="space-y-2">
        {visibleItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) =>
              `flex items-center justify-between rounded-2xl px-3 py-2.5 text-sm transition ${
                isActive
                  ? 'bg-resort-500/10 text-resort-600 font-semibold dark:bg-resort-500/20 dark:text-resort-400'
                  : 'text-text-secondary hover:bg-surface hover:text-text-primary dark:text-dark-text-secondary dark:hover:bg-dark-surface dark:hover:text-dark-text-primary'
              }`
            }
          >
            <span>{item.label}</span>
          </NavLink>
        ))}
      </nav>

      <div className="mt-6 rounded-2xl border border-border bg-surface-elevated/50 p-3 dark:border-dark-border dark:bg-dark-surface-elevated/50">
        <p className="text-xs uppercase tracking-[0.2em] text-text-muted dark:text-dark-text-muted">Signed in</p>
        <p className="mt-2 font-medium text-text-primary dark:text-dark-text-primary">{user?.name || 'Administrator'}</p>
        <p className="text-sm text-text-muted dark:text-dark-text-muted">{user?.role || 'admin'}</p>
      </div>
    </aside>
  );
}