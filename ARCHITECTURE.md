# Architecture Overview

## Frontend
- React + Vite + Tailwind CSS
- Public resort website and admin portal coexist in the same application
- `/` remains the guest-facing resort site
- `/admin` is the authenticated administrative system

## Backend
- Express API with route-level and permission-level middleware
- `server/routes/adminRoutes.js` exposes the RBAC APIs
- `server/controllers/adminController.js` manages admin operations and dashboard metrics
- `server/middleware/authMiddleware.js` enforces authentication and permission checks

## Data layer
- The project is Supabase-ready and uses a PostgreSQL schema in `supabase/schema.sql`
- Local development keeps a mock database layer in `server/data/mockStore.js` until the live database schema is provisioned
- Staff roles, permissions, and audit logs are represented in memory and mapped to the Supabase schema structure

## RBAC design
- Roles and permissions are dynamic and managed through admin APIs
- Super Admin has unrestricted access
- Staff and role assignments are evaluated server-side, not only in the UI
- Audit logging records important administrative actions

## Security and operations
- Admin auth uses a local development flow currently, but the architecture is prepared for Supabase Auth integration
- Sensitive configuration remains in environment variables
- Payment integrations remain intentionally deferred pending real provider setup and user approval
