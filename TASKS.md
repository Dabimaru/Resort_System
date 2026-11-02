# Task Tracker

## Completed
- Public resort website preserved and expanded
- Admin portal added with `/admin` access
- Super Admin login using `admin / admin` and email `admin@resort.local`
- RBAC role and permission system implemented
- Staff management page added
- Dynamic role creation and permission assignment included
- Booking and dashboard stats available to protected admin routes
- Audit log and system settings endpoints added
- Database SQL schema extended for RBAC tables
- Local admin provisioning helper added
- Automated tests added for admin login and permission updates

## In progress
- Real Supabase Auth sign-in and production RLS enforcement
- Live database migration to the configured Supabase project
- Database-backed replacement for the development-only local fallback layer

## Pending
- Full live production deployment
- Real payment gateway integration
- Realtime admin notifications
- Full reporting exports and PDF generation

## Current status
- The website, booking flow, and admin portal are running locally.
- Payment methods are intentionally limited to GCash, QR PH, and cash for this phase.
- The Supabase connection is configured with the provided project URL and publishable key; live table provisioning still needs the service-role key to complete.
