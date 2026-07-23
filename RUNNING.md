# Running the project locally

The platform is three separate processes that must be started in order:
**Postgres → API → frontend**. The frontend renders on the server and fetches
from the API, so a page load fails if the API is down, and the API fails to
answer if Postgres is down.

```text
Next.js (bookingapp)  :3000  ──►  NestJS (booking-api)  :3001  ──►  Postgres  :5433
```

## Ports

| Service                | Port   | Where it comes from                          |
| ---------------------- | ------ | -------------------------------------------- |
| Next.js frontend       | `3000` | `next dev` default                            |
| NestJS API             | `3001` | `PORT` in `booking-api/.env`                  |
| Postgres (in Docker)   | `5433` | host `5433` → container `5432`                |

The API port must match `API_URL` in `bookingapp/.env.local`, and the frontend
port must match `FRONTEND_URL` in `booking-api/.env` (used for CORS).

> **Known drift:** `booking-api/.env` currently sets `PORT=3004`, but
> `.env.example` and the frontend's `API_URL` both expect `3001`. Until that is
> reconciled, either set `PORT=3001` in `booking-api/.env` (recommended) or
> override it at launch with `PORT=3001 npm run start:dev`. `main.ts` uses
> `getOrThrow('PORT')`, so there is no fallback default.

## Prerequisites

- Node.js and npm
- Docker — provided here by [Colima](https://github.com/abiosoft/colima), not
  Docker Desktop. The Docker CLI talks to the Colima VM, and Colima forwards
  host ports into it over SSH (so `lsof -i :5433` shows an `ssh` process rather
  than `docker` — that is expected, not a conflict).

## Paths

| Project    | Path                                  |
| ---------- | ------------------------------------- |
| Frontend   | `~/Projects/react/bookingapp`         |
| Backend    | `~/Projects/react/booking-api`        |

## Start everything

### 1. Postgres

Colima must be running before any `docker` command works:

```bash
colima status || colima start
```

The database container already exists — start it, don't recreate it (see
[Recreating the container](#recreating-the-database-container-from-scratch)):

```bash
docker start booking-postgres
docker exec booking-postgres pg_isready -U booking
# expect: /var/run/postgresql:5432 - accepting connections
```

`pg_isready` here runs *inside* the container, so it confirms Postgres booted
but not that the host port forward works. The API's first successful request is
the real end-to-end proof.

### 2. API (NestJS)

```bash
cd ~/Projects/react/booking-api
npm run start:dev          # or: PORT=3001 npm run start:dev  (see port drift note)
```

Watch mode; recompiles on save. Swagger is served by this app once it is up.

Apply any pending migrations first if the schema changed:

```bash
npx prisma migrate dev     # never use `prisma db push`
npx prisma migrate status  # verify in sync
```

### 3. Frontend (Next.js)

```bash
cd ~/Projects/react/bookingapp
npm run dev
```

Open **<http://localhost:3000>**.

## Verify it is all up

```bash
# each should print 200
curl -s -o /dev/null -w 'frontend %{http_code}\n' http://localhost:3000/
curl -s -o /dev/null -w 'api      %{http_code}\n' http://localhost:3001/restaurants/the-golden-fork
```

The API check hits a database-backed endpoint, so a `200` there proves the
whole chain (API → Postgres) works, not just that the process is listening.

Show what is actually bound:

```bash
for p in 3000 3001 5433; do
  printf '%-6s %s\n' "$p" "$(lsof -nP -iTCP:$p -sTCP:LISTEN | awk 'NR==2{print $1" (pid "$2")"}')"
done
```

## Routes

| Route                  | Notes                                        |
| ---------------------- | -------------------------------------------- |
| `/`                    | Landing page                                  |
| `/reservations`        | Public booking flow                           |
| `/admin`               | Dashboard                                     |
| `/admin/reservations`  | Reservation list                              |
| `/admin/calendar`      | Day/week booking calendar                     |
| `/menu`                | **404 for now** — menu module is Phase 5      |

## Environment files

Neither `.env` file is committed; copy from the matching `.env.example` on a
fresh clone.

`bookingapp/.env.local`:

```ini
API_URL="http://localhost:3001"
RESTAURANT_SLUG="the-golden-fork"
```

`booking-api/.env`:

```ini
DATABASE_URL="postgresql://booking:booking_password@localhost:5433/booking_db"
PORT=3001
FRONTEND_URL="http://localhost:3000"
```

These are throwaway local-only credentials. Nothing here belongs in a
`NEXT_PUBLIC_` variable — `API_URL` is read server-side only.

## Stopping

```bash
# Ctrl-C the two npm processes, then:
docker stop booking-postgres
```

Stopping the container is safe; data lives in a Docker volume and survives.

## Troubleshooting

**Frontend loads but pages error / data is missing** — the API is down or on the
wrong port. Confirm `curl http://localhost:3001/restaurants/the-golden-fork`
returns JSON, and that it matches `API_URL`.

**API exits immediately at boot** — usually `getOrThrow('PORT')` with no `PORT`
in `.env`, or Postgres unreachable. Check `docker ps` shows `booking-postgres`
as `Up`.

**`Cannot connect to the Docker daemon`** — Colima is not running: `colima start`.

**`EADDRINUSE` on 3000** — Next.js will offer the next free port, but the API's
`FRONTEND_URL` CORS entry still points at `3000`. Free the port instead:
`lsof -nP -iTCP:3000 -sTCP:LISTEN` then kill the stale process.

### Recreating the database container from scratch

Only if `booking-postgres` no longer exists. Note the existing container uses an
**anonymous** volume, so removing it orphans the current data — back up first if
you care about the dev bookings.

```bash
docker run -d --name booking-postgres \
  -e POSTGRES_USER=booking \
  -e POSTGRES_PASSWORD=booking_password \
  -e POSTGRES_DB=booking_db \
  -p 5433:5432 \
  -v booking_pgdata:/var/lib/postgresql/data \
  postgres:17-alpine
```

Then rebuild the schema and seed data:

```bash
cd ~/Projects/react/booking-api
npx prisma migrate dev
npm run db:seed
```
