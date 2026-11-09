import { getUserByToken } from '../services/authService.js';
import { getUserPermissions } from '../data/mockStore.js';

export const requireAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return res.status(401).json({ message: 'Authentication token is required.' });
  }

  try {
    const user = await getUserByToken(token);
    if (!user) {
      return res.status(401).json({ message: 'Invalid or expired token.' });
    }

    req.user = user;
    return next();
  } catch (error) {
    return next(error);
  }
};

// Attaches req.user when a valid token is present but never blocks the request.
// Availability checks and reservation requests stay open to guests, yet a signed-in
// customer still gets their booking tied to their account.
export const optionalAuth = async (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const token = authHeader.startsWith('Bearer ') ? authHeader.replace('Bearer ', '') : null;

  if (!token) {
    return next();
  }

  try {
    const user = await getUserByToken(token);
    if (user) {
      req.user = user;
    }
  } catch (error) {
    return next(error);
  }

  return next();
};

export const requireRole = (role) => (req, res, next) => {
  if (!req.user || req.user.role !== role) {
    return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  }

  return next();
};

export const requireAnyRole = (roles) => (req, res, next) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  if (!req.user || !allowedRoles.includes(req.user.role)) {
    return res.status(403).json({ message: 'You do not have permission to access this resource.' });
  }

  return next();
};

export const requirePermission = (permission) => (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const permissions = new Set(getUserPermissions(user));
  const hasPermission = permissions.has(permission) || user.role === 'admin' || user.role === 'super_admin';

  if (!hasPermission) {
    return res.status(403).json({ message: 'You do not have the required permission for this action.' });
  }

  return next();
};

export const requireAnyPermission = (permissions) => (req, res, next) => {
  const user = req.user;

  if (!user) {
    return res.status(401).json({ message: 'Authentication required.' });
  }

  const userPermissions = new Set(getUserPermissions(user));
  const allowed = permissions.some((permission) => userPermissions.has(permission) || user.role === 'admin' || user.role === 'super_admin');

  if (!allowed) {
    return res.status(403).json({ message: 'You do not have the required permissions for this action.' });
  }

  return next();
};
