# wizKote Bank

## Overview
wizKote Bank is a full-stack banking platform that digitalizes premium Swiss banking services. It features a client dashboard with accounts management, transfers with progress tracking, card management, loan simulator, digital vault, and secure messaging. An admin dashboard allows bank staff to manage transfers, generate OTP codes, and communicate with clients.

## Tech Stack
- Frontend: React + Vite + Tailwind CSS + shadcn/ui + Wouter (routing)
- Backend: Express.js + PostgreSQL + Drizzle ORM
- Auth: Session-based with bcryptjs password hashing
- Theme: Swiss luxury design (blue nuit + gold accents) with dark/light mode

## Project Structure
- `client/src/pages/` - All page components (landing, login, dashboard, transfers, accounts, cards, loans, vault, messages, admin)
- `client/src/components/` - Shared components (app-sidebar, theme-provider)
- `client/src/lib/` - Auth context, query client, utilities
- `server/` - Express routes, storage layer, database connection, seed data
- `shared/schema.ts` - Drizzle schema definitions shared between frontend and backend

## Routing
- `/` - Public landing page (unauthenticated)
- `/login` - Login/Register page (unauthenticated)
- `/dashboard` - Client dashboard or Admin panel (authenticated)
- `/transfers`, `/accounts`, `/cards`, `/loans`, `/vault`, `/messages` - Client pages (authenticated)
- `/admin`, `/admin/transfers`, `/admin/documents`, `/admin/settings` - Admin pages (authenticated admin)
- Authenticated users visiting `/` or `/login` are redirected to `/dashboard`

## Key Features
- **Landing Page**: Public Swiss luxury landing page with services, security info, stats, and CTA
- **Authentication**: Login/Register with session-based auth. Roles: client, admin
- **Dashboard**: Balance overview, charts, recent transactions, quick actions
- **Transfers**: Create transfers, track progress with steps, OTP validation
- **Accounts**: Sub-accounts (savings 4% interest, joint, child), IBAN generation
- **Cards**: Visa Infinite / Mastercard Gold, contactless, limits, international
- **Loan Simulator**: Mortgage and personal loan calculator
- **Digital Vault**: Document storage with encryption badge
- **Messaging**: Secure client-advisor communication
- **Admin**: Manage transfers (progress, status, OTP), client list, messaging

## Default Credentials
- Client: username=`client`, password=`client123`
- Admin: username=`admin`, password=`admin123`

## Database
PostgreSQL with Drizzle ORM. Schema push via `npm run db:push`.

## Environment
- `DATABASE_URL` - PostgreSQL connection string
- `SESSION_SECRET` - Express session secret
- Port: 5000
