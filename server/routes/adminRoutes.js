import express from 'express';
import {
  adminLoginController,
  adminLogoutController,
  adminMeController,
  createRole,
  createStaffAccount,
  deleteRole,
  getAdminDashboardStats,
  getAuditLogs,
  getDashboardMetrics,
  listAdminBookings,
  listAdminPayments,
  listDateAvailability,
  listInquiries,
  listPermissions,
  listRoles,
  listStaffAccounts,
  listSystemSettings,
  saveRolePermissions,
  toggleStaffStatus,
  updateBookingStatus,
  updateDateAvailability,
  updateRole,
  updateStaffAccount,
} from '../controllers/adminController.js';
import { listChatThreads, replyToChatThread } from '../controllers/chatController.js';
import { requireAnyPermission, requireAuth, requireAnyRole, requirePermission } from '../middleware/authMiddleware.js';

const router = express.Router();

router.post('/auth/login', adminLoginController);
router.post('/auth/logout', requireAuth, adminLogoutController);
router.get('/auth/me', requireAuth, adminMeController);

router.get('/dashboard', requireAuth, requireAnyRole(['admin', 'frontdesk']), getDashboardMetrics);
router.get('/dashboard/stats', requireAuth, requireAnyPermission(['reports.view', 'bookings.view']), getAdminDashboardStats);
router.get('/audit-logs', requireAuth, requirePermission('settings.view'), getAuditLogs);

router.get('/staff', requireAuth, requirePermission('staff.view'), listStaffAccounts);
router.post('/staff', requireAuth, requirePermission('staff.create'), createStaffAccount);
router.put('/staff/:id', requireAuth, requirePermission('staff.edit'), updateStaffAccount);
router.patch('/staff/:id/status', requireAuth, requirePermission('staff.deactivate'), toggleStaffStatus);

router.get('/roles', requireAuth, requirePermission('roles.view'), listRoles);
router.post('/roles', requireAuth, requirePermission('roles.create'), createRole);
router.put('/roles/:id', requireAuth, requirePermission('roles.edit'), updateRole);
router.delete('/roles/:id', requireAuth, requirePermission('roles.delete'), deleteRole);
router.put('/roles/:id/permissions', requireAuth, requirePermission('roles.edit'), saveRolePermissions);

router.get('/permissions', requireAuth, requirePermission('roles.view'), listPermissions);
router.get('/bookings', requireAuth, requirePermission('bookings.view'), listAdminBookings);
router.patch('/bookings/:id/status', requireAuth, requirePermission('bookings.confirm'), updateBookingStatus);
router.get('/payments', requireAuth, requireAnyPermission(['bookings.view', 'reports.view']), listAdminPayments);
router.get('/availability', requireAuth, requirePermission('bookings.view'), listDateAvailability);
router.patch('/availability', requireAuth, requirePermission('bookings.confirm'), updateDateAvailability);
router.get('/inquiries', requireAuth, requirePermission('inquiries.view'), listInquiries);
router.get('/chat', requireAuth, requirePermission('chat.view'), listChatThreads);
router.post('/chat/:id/reply', requireAuth, requirePermission('chat.reply'), replyToChatThread);
router.get('/settings', requireAuth, requirePermission('settings.view'), listSystemSettings);

export default router;
