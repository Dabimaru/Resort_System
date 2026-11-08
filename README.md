# Resort_System

Azure Cove Resort is a luxury resort website and resort management system foundation built with Vite + React + Tailwind on the frontend, Node.js + Express on the backend, and a Supabase-ready PostgreSQL architecture.

## Stack
- Frontend: React + Vite + Tailwind CSS
- Backend: Node.js + Express
- Database: Supabase PostgreSQL with SQL schema and a local fallback mock layer
- Authentication: guest account flw + admin RBAC with role/permission enforcement
- Storage: Supabase-ready structure for rooms, media, and resort data
- QA: automated tests for auth, booking, admin flows, payment, and support chat

## Project features
- Premium public resort website with hero, rooms, amenities, gallery, testimonials, and contact sections
- Reservation and inquiry APIs
- Guest account sign-up and sign-in flow
- Availability checker with booking logic and blocked-date support
- Admin portal for dashboard, bookings, rooms, roles, staff, reports, and settings
- Persistent, permission-protected admin alerts for new bookings, inquiries, support chats, and settled payments
- Support chat widget for guest customers and admin replies
- Supabase configuration and schema bootstrap support

## Branching strategy
This repository follows a simple Git workflow for large feature work:
- `main` — stable production-ready branch
- `develop` — active integration branch for the next set of changes
- `feature/public-website` — customer-facing landing pages and branding
- `feature/admin-portal` — admin dashboard and management screens
- `feature/auth-customer-flow` — guest sign-up, sign-in, and session handling
- `feature/booking-availability` — reservation, date blocking, and room availability logic
- `feature/chat-support` — live support widget and admin support replies
- `feature/supabase-live-data` — Supabase integration and schema work
- `feature/test-automation` — automated coverage and QA validation

Use `develop` for the main working branch and create a feature branch for each module before making changes. Merge back into `develop` when a feature is stable, and keep `main` reserved for release-ready state.

## Local admin access
Development super-admin account:
- Username: `admin`
- Email: `admin@resort.local`
- Password: `admin`

Admin routes:
- `/admin`
- `/admin/dashboard`
- `/admin/staff`
- `/admin/roles`
- `/admin/permissions`
- `/admin/bookings`
- `/admin/rooms`
- `/admin/inquiries`
- `/admin/reports`
- `/admin/settings`
- `/admin/profile`

## Installation
1. Install dependencies:
   `npm install`
2. Copy `.env.example` to `.env` and set the Supabase values.
3. Start the app in development mode:
   `npm run dev`
4. Start just the backend:
   `npm run server`
5. Start just the frontend:
   `npm run dev`

## Database setup
- Supabase schema is available in `supabase/schema.sql`.
- Bootstrap helper: `npm run db:setup`
- Local admin provisioning helper: `npm run provision:admin`

## Testing
Run the automated test suite:
`npm test`

## Build
Production build:
`npm run build`

## Environment variables
Key variables include:
- `VITE_SUPABASE_URL`
- `VITE_SUPABASE_PUBLISHABLE_KEY`
- `SUPABASE_URL`
- `SUPABASE_ANON_KEY`
- `SUPABASE_SERVICE_ROLE_KEY`
- `VITE_API_URL`

## Notes
- Live Supabase schema creation requires the project service-role key.
- Until the real schema is applied, the app uses a local fallback layer for development and testing stability.
- Backend permission checks enforce access control so the UI alone is not the only authorization boundary.
- Apply the latest schema with `npm run db:setup` to create the notifications table. Live notification storage requires `SUPABASE_SERVICE_ROLE_KEY`; the key remains server-side and is never exposed to the frontend.
