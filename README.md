# Slooze Food (Full-Stack Take-Home Application)

##  Project Overview

A role-aware, geo-scoped food ordering platform.

- Backend: Express.js + TypeScript + Prisma + PostgreSQL
- Frontend: Next.js 14 (App Router) + TypeScript + Tailwind CSS
- Auth: JWT
- Roles: ADMIN, MANAGER, MEMBER
- Country access: INDIA, AMERICA

## Features implemented

- Role-based permissions
- Country-level scoping: Admin can see all, others only own country
- Restaurants & menu browsing
- Order creation (all roles), placement/cancellation (ADMIN/MANAGER)
- Payment methods (ADMIN CRUD + set-default)
- Frontend auth state + protected routes
- Dark UI and responsive design
- Toast notifications

## 🗂️ Repository Structure

```
backend/
  .env.example
  db/
  src/
    controllers/
    middleware/
    routes/
    utils/
    index.ts
frontend/
  app/
  components/
  context/
  lib/
  middleware.ts
  ...
```

## 🔧 Prerequisites

- Node.js (18+)
- Bun (for backend run scripts optional)
- PostgreSQL

## 🐘 Backend Setup

1. Go to backend folder:

```bash
cd backend
```

2. Copy env template:

```bash
cp .env.example .env
```

3. Set `DATABASE_URL` to your Postgres DB. Example:

```dotenv
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
JWT_SECRET="your-secret-key"
PORT=5000
```

4. Install dependencies:

```bash
bun install
# or npm install
```

5. Apply Prisma migrations (if needed):

```bash
npx prisma migrate deploy
```

6. Seed database:

```bash
npx prisma db seed
# or bun run db/src/seed.ts
```

7. Start server:

```bash
bun run src/index.ts
# or node (with transpilation)
```

8. Confirm health:

```bash
curl http://localhost:5000/api/health
```

## 🧪 Backend API Endpoints

Authentication

- POST `/api/auth/login`
- POST `/api/auth/me`

Restaurants

- GET `/api/restaurants`
- GET `/api/restaurants/:id/menu`

Orders

- POST `/api/orders`
- GET `/api/orders`
- GET `/api/orders/:id`
- POST `/api/orders/:id/place`
- PATCH `/api/orders/:id/cancel`

Payments

- GET `/api/payments`
- POST `/api/payments` (ADMIN)
- PUT `/api/payments/:id` (ADMIN)
- DELETE `/api/payments/:id` (ADMIN)
- PATCH `/api/payments/:id/default`

## 🧾 Frontend Setup

1. Go to frontend folder:

```bash
cd frontend
```

2. Install dependencies:

```bash
npm install
# or bun install
```

3. Start dev server:

```bash
npm run dev
```

4. Open: `http://localhost:3000`

## 🔐 Login test users

| Name | Role | Country | Email | Password |
| --- | --- | --- | --- | --- |
| Nick Fury | ADMIN | AMERICA | nick@slooze.com | admin123 |
| Captain Marvel | MANAGER | INDIA | marvel@slooze.com | pass123 |
| Captain America | MANAGER | AMERICA | america@slooze.com | pass123 |
| Thanos | MEMBER | INDIA | thanos@slooze.com | pass123 |
| Thor | MEMBER | INDIA | thor@slooze.com | pass123 |
| Travis | MEMBER | AMERICA | travis@slooze.com | pass123 |

## 🧪 Verified checks performed

- Backend health endpoint working
- Auth login sequence (token + user returned)
- Country-scoped restaurant menu
- Order flow: create, place, list, cancel
- Payment flow: list, add, update, delete, default
- Frontend build passes: `npm run build` (Success)

##  Notes

- API uses JWT in `Authorization: Bearer <token>`
- Frontend uses `localStorage` + cookies for auth and middleware guard
- Admin has full access; Manager/Member are country-scoped by `scopeToCountry`
- Members cannot place/cancel orders

## 🐳 Docker Quick Start

From repo root:

```bash
docker compose up --build
```

Then open:

- Frontend: http://localhost:3000
- Backend: http://localhost:5000/api/health

To stop:

```bash
docker compose down
```


