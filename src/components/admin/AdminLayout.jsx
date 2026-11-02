import { Outlet } from 'react-router-dom';
import AdminHeader from './AdminHeader';
import AdminSidebar from './AdminSidebar';

export default function AdminLayout({ user, permissions, onSignOut }) {
  return (
    <div className="min-h-screen bg-slate-950 px-4 py-8 text-white">
      <div className="mx-auto max-w-7xl space-y-6">
        <AdminHeader user={user} onSignOut={onSignOut} />
        <div className="flex flex-col gap-6 md:flex-row">
          <AdminSidebar user={user} permissions={permissions} />
          <main className="flex-1">
            <Outlet />
          </main>
        </div>
      </div>
    </div>
  );
}
