import { useMemo } from 'react';

export function usePermissions(user) {
  return useMemo(() => {
    const permissions = new Set(user?.permissions || []);
    user?.roles?.forEach((role) => {
      if (role === 'super-admin' || role === 'admin') {
        permissions.add('all');
      }
    });

    return permissions;
  }, [user]);
}
