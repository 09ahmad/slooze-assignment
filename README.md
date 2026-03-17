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
- Bun (optional, for backend run commands)
- PostgreSQL (local or cloud, e.g. Neon)
- Docker + Docker Compose (for containerized mode)

## 🛠️ Environment variables (`backend/.env`)

From `backend` folder:

```bash
cd backend
cp .env.example .env
```

Default recommended values:

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
JWT_SECRET="superSecretKey"
PORT=5000
```

### `DATABASE_URL` options

1. Local Postgres (recommended for local dev):

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@localhost:5432/postgres"
```

2. Docker Compose Postgres container (used in repo `docker-compose.yml`):

```env
DATABASE_URL="postgresql://postgres:mysecretpassword@db:5432/postgres"
```

3. Neon (cloud Postgres):

```env
DATABASE_URL="postgresql://<user>:<password>@<hostname>:5432/<db>?sslmode=require"
```

### JWT setup

- `JWT_SECRET` is any strong secret string (e.g. a UUID or long random phrase).
- This is used to sign and verify tokens in `backend/src/utils/jwt.ts`.

### Notes

- Ensure `.env` is not committed to VCS.
- If using Docker Compose, keep the same values in `backend/.env` and `docker-compose.yml` service mapping.

## 🐘 Backend Setup (Local)

1. Go to backend folder:

```bash
cd backend
```

2. Copy `.env` and edit values:

```bash
cp .env.example .env
# edit backend/.env
```

3. Install dependencies:

```bash
bun install
# or
npm install
```

4. Generate Prisma client:

```bash
# with npm
npx prisma generate --schema db/prisma/schema.prisma
# or with bun and Prisma v7 config
bunx --bun prisma generate --config db/prisma.config.ts
```

5. Migrate DB:

```bash
# local or Neon path
npx prisma migrate deploy --schema db/prisma/schema.prisma
# or with bun config
bunx --bun prisma migrate deploy --config db/prisma.config.ts
```

6. Seed data:

```bash
npx prisma db seed --schema db/prisma/schema.prisma
# or
bunx --bun prisma db seed --config db/prisma.config.ts
```

7. Start backend:

```bash
bun run src/index.ts
# or
npm run start
```

8. Validate backend:

```bash
curl http://localhost:5000/api/health
```

---

## 🐳 Docker Compose Setup (Backend + Postgres + Frontend)

From repo root:

```bash
docker compose down -v
docker compose up --build
```

- Backend health: `http://localhost:5000/api/health`
- Frontend: `http://localhost:3000`

Stop:

```bash
docker compose down
```

### Docker notes:

- In `backend/.env` inside Docker, use `DATABASE_URL="postgresql://postgres:mysecretpassword@db:5432/postgres"`.
- If you changed creds, update `docker-compose.yml` and `.env` accordingly.
- To run Prisma inside backend container:

```bash
docker compose exec backend bunx --bun prisma generate --config db/prisma.config.ts

docker compose exec backend bunx --bun prisma migrate deploy --config db/prisma.config.ts

docker compose exec backend bunx --bun prisma db seed --config db/prisma.config.ts
```

---

## ⚙️ Frontend Setup (Local)

```bash
cd frontend
npm install
npm run dev
```

Open: `http://localhost:3000`

---

## 🧪 Quick Sanity Checks

1. Login (example):

```bash
curl -X POST http://localhost:5000/api/auth/login \
  -H 'Content-Type: application/json' \
  -d '{"email":"nick@slooze.com","password":"admin123"}'
```

2. Auth me:

```bash
curl http://localhost:5000/api/auth/me \
  -H 'Authorization: Bearer <token>'
```

3. Restaurants:

```bash
curl http://localhost:5000/api/restaurants
```

4. Menu (id):

```bash
curl http://localhost:5000/api/restaurants/1/menu
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


