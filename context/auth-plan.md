# Auth: NextAuth (Auth.js v5) fronting NestJS JWT

## Context

The admin area has **no authentication** and every admin API endpoint is
**open** — both are called out as tech-debt (`context/tech-debt.md`). Verified
still true: a grep for `UseGuards|AuthGuard|@Roles|passport|Throttl` across
`booking-api/src` returns nothing; two controllers even carry the comment "Open
until the authentication feature adds role guards". The spec
(`project-overview.md` §J, `project-spec.md` §E) prescribes a NestJS-owned auth:
Argon2, `/auth/login|refresh|logout|me`, JWT access + refresh tokens, role guards
(OWNER / MANAGER / STAFF).

**Decisions taken (this session):**
- **NextAuth wraps NestJS.** NestJS stays the credential authority (Argon2 +
  `/auth/login`); Auth.js v5 owns the *frontend* session cookie, the route-guard,
  and carries the NestJS tokens **inside its encrypted JWT — never on the session
  object** (see "Review outcome" #1).
- **Scope:** login + `/admin` protection + role-gating + seed one OWNER. **No**
  staff-management CRUD UI (deferred).
- **Email/password only.** Google OAuth + password reset deferred (seams left).

**Key architectural fact that shapes everything:** the frontend is a pure BFF —
`src/lib/api.ts` is server-only (`API_URL`, not `NEXT_PUBLIC_`, verified
`api.ts:27`), the browser never calls booking-api directly. So the spec's
"refresh token in an HTTP-only cookie" becomes: NextAuth's encrypted session
cookie holds the tokens on the Next.js side, and NestJS `/auth/refresh` takes the
refresh token in the request **body** (server-to-server). NestJS auth is
**stateless JWT** — no refresh-token table, no OAuth accounts table, **no Prisma
migration** (`User` already has `passwordHash`, `role`, `restaurantId`;
`prisma/seed.ts` creates the single restaurant but **no** User row yet).

Single-restaurant MVP: `the-golden-fork` is the only restaurant everywhere
(`seed.ts:13`, `api.ts:28`); "multiple branches" is out of scope. This
deliberately narrows several classic multi-tenant concerns (below).

Compatibility verified: `next-auth@5.0.0-beta.32` peer-supports `next ^16` +
`react 19`; repo is Next 16.2.10 / React 19.2.4.

Branch `feature/authentication` in **both** repos. Backend lands first.

---

## Review outcome — hardening applied after an external review (verified)

An external review + a 5-agent verification pass (docs + codebase) produced these
changes vs. the first draft. Refuted items are recorded so they aren't re-raised.

1. **Tokens stay server-only (CONFIRMED — apply).** Do **not** put `accessToken`
   on the `session` callback — anything it returns is shipped to the browser via
   `/api/auth/session` / `useSession()`. Expose only `role`, `restaurantId`,
   `error`. Read the backend token **server-side** with `getToken()` from
   `next-auth/jwt` (not `auth()`, which only returns the session shape).
2. **Default-deny backend authz (CONFIRMED — apply, structural).** Replace the
   hand-maintained per-endpoint guard list with a **global** `JwtAuthGuard`
   (`APP_GUARD`) + a `@Public()` decorator on customer endpoints. A forgotten
   annotation then fails **closed** (a customer route 401s loudly in tests)
   instead of silently leaving an admin route open. This also auto-closes a gap
   the first draft's table **missed**: `PUT /restaurants/:id/business-hours` and
   `POST/PATCH/DELETE /restaurants/:id/blocked-periods` are currently public and
   would have stayed public.
3. **`proxy.ts`, not `middleware.ts` (CONFIRMED — apply).** Next.js 16 deprecated
   (not removed) `middleware` → `proxy`. Use `src/proxy.ts` with
   `export { auth as proxy } from "@/auth"`. Bonus: `proxy` runs on the Node
   runtime, so the jwt-callback `fetch('/auth/refresh')` needs no edge/`auth.config`
   split.
4. **Refresh = reissuance, documented (CONFIRMED — apply).** Stateless refresh
   can't revoke a token before its `exp`; logout is enforced by NextAuth clearing
   its cookie (the token's only copy in the BFF model). Relabel "rotation" →
   "reissuance", add `type` + `jti` + `iss`/`aud` claims, assert the two secrets
   differ at boot, keep TTL env-tunable. **Defer** a `RefreshSession` table (it
   would import the Auth.js single-use refresh race the plan already flags).
5. **Login throttling + Argon2 timing + seed safety (CONFIRMED — apply).**
   `@nestjs/throttler` (already required by the spec), a dummy Argon2 verify on
   unknown-email, and a production guard on the OWNER seed password.
6. **`session.maxAge` = refresh TTL (CONFIRMED, minor).** Align so the cookie
   doesn't outlive the backend refresh token.
7. **Tenant isolation (real principle, NOT blocking here).** One restaurant, all
   staff belong to it — no "restaurant B" to reach. Add cheap scoping by
   `req.user.restaurantId` as a defense-in-depth seam; do not gate the feature.
8. **REFUTED — do not change:** public `PATCH /reservations/:id/cancel` is not an
   IDOR (cancels by an unguessable cuid gated behind the confirmation code;
   guarding it would break customer self-cancel); no `/admin/login` redirect loop
   (beta.32 has a built-in signInPage guard); access/refresh cross-use is already
   blocked by separate secrets; admin fetches are already `no-store`
   (`api.ts:57-62`).

---

## Part A — booking-api (NestJS): auth module + guards

**Deps:** `@nestjs/jwt`, `@nestjs/passport`, `passport`, `passport-jwt`,
`argon2`, `@nestjs/throttler`, `-D @types/passport-jwt`.

**Env** (`src/config/env.validation.ts`): required `JWT_ACCESS_SECRET`,
`JWT_REFRESH_SECRET`; optional `JWT_ACCESS_TTL` (default `15m`),
`JWT_REFRESH_TTL` (default `7d`), `SEED_OWNER_EMAIL`, `SEED_OWNER_PASSWORD`.
**Assert `JWT_ACCESS_SECRET !== JWT_REFRESH_SECRET`** in `validate()`.

**New `src/auth/` module** (mirrors existing module layout):
- `auth.service.ts`
  - `validateCredentials(email, password)` — `findUnique({email})` then
    `argon2.verify(user.passwordHash, password)`. **On no-user, still run
    `argon2.verify(DUMMY_HASH, password)`** (module-level precomputed hash) and
    throw the **same** `UnauthorizedException` message — kills the timing oracle.
  - `login(user)` — sign access `{sub, role, restaurantId, email, name, type:'access', jti, iss:'booking-api', aud:'booking-web'}` with `JWT_ACCESS_SECRET`/TTL
    and refresh `{sub, type:'refresh', jti, iss, aud}` with `JWT_REFRESH_SECRET`/TTL;
    return `{ user: safeUser, accessToken, refreshToken, accessTokenExpires }`.
  - `refresh(refreshToken)` — verify against refresh secret, assert
    `type==='refresh'` + `iss`/`aud`, reload user (catches a deleted row),
    **re-issue both tokens (reissuance, not revocable rotation)**.
  - `getMe(userId)` — safe profile (no `passwordHash`).
- `auth.controller.ts` (`@Controller('auth')`): `POST /auth/login`
  (**`@Throttle({ default: { limit: 5, ttl: 60000 } })`**), `POST /auth/refresh`,
  `POST /auth/logout` → 204 (stateless; NextAuth clears its own session),
  `GET /auth/me` (authenticated).
- `strategies/jwt.strategy.ts` — passport-jwt, `fromAuthHeaderAsBearerToken()`,
  access secret; `validate(payload)` asserts `type==='access'` and returns
  `{ userId, role, restaurantId }` onto `request.user`.
- `guards/jwt-auth.guard.ts` — extends `AuthGuard('jwt')`, injects `Reflector`,
  **short-circuits when `@Public()` metadata is present** (`getAllAndOverride(IS_PUBLIC_KEY, [handler, class])`).
- `guards/roles.guard.ts` (reads `@Roles()` vs `request.user.role`).
- `decorators/`: `public.decorator.ts` (`IS_PUBLIC_KEY` + `Public`),
  `roles.decorator.ts`, `current-user.decorator.ts`.
- `dto/login.dto.ts`, `dto/refresh.dto.ts`; `entities/` for Swagger.

**Wire authz globally (default-deny) in `app.module.ts`:**
```ts
providers: [
  { provide: APP_GUARD, useClass: JwtAuthGuard },   // authn first, everything protected
  { provide: APP_GUARD, useClass: RolesGuard },     // then role checks (@Roles)
  { provide: APP_GUARD, useClass: ThrottlerGuard },
]
```
Register `AuthModule` + `ThrottlerModule.forRoot([{ ttl: 60000, limit: 10 }])`.
Behind a PaaS proxy set `app.set('trust proxy', 1)` in `main.ts` so the throttler
keys on the real client IP.

**Mark the PUBLIC (customer) endpoints with `@Public()`** — everything else is
protected by default:
`GET /restaurants/:slug`, `GET /:id/availability`, `POST /reservations`,
`GET /reservations/:code`, `GET /reservations/lookup`,
`PATCH /reservations/:id/cancel` *(dual-use; customer manage page needs it)*,
public menu + featured, `POST /orders`, `GET /orders/:number`,
`GET /orders/lookup`.

**Add `@Roles()` where the permission table restricts** (all others: any staff
role): **OWNER** → `PATCH /restaurants/:id`, `:id/settings`; **OWNER/MANAGER** →
menu category/item `POST/PATCH/DELETE`, `PUT /business-hours`, blocked-periods
`POST/PATCH/DELETE`, tables `POST/PATCH/DELETE`. Reservation/order management +
`GET` admin lists + `GET /tables` stay all-staff. *(Tenant seam: services that
take a `:restaurantId` path param should scope on `req.user.restaurantId` — cheap
defense-in-depth, single restaurant so not load-bearing.)*

**Seed one OWNER** — extend `prisma/seed.ts` to **upsert by email** (`update: {}`
so re-seeding never resets a live password) with an `argon2.hash()`ed password:
```ts
const pw = process.env.SEED_OWNER_PASSWORD;
if (!pw && process.env.NODE_ENV === 'production')
  throw new Error('SEED_OWNER_PASSWORD is required to seed an OWNER in production');
const passwordHash = await argon2.hash(pw ?? 'dev-only-changeme');
```
No new migration — `prisma migrate status` to confirm `User` is already applied.

---

## Part B — booking-web (Next.js): Auth.js v5

**Dep:** `next-auth@beta` (5.0.0-beta.32). **Env:** `AUTH_SECRET`
(`npx auth secret`), reuse `API_URL`. Add both to `.env.example`.

**New files:**
- `src/auth.ts` — `NextAuth({...})` exporting `{ handlers, auth, signIn, signOut }`:
  - `Credentials` provider; `authorize` **fetches `${API_URL}/auth/login`
    directly** with `cache:'no-store'` + a timeout: backend **401 → return
    `null`** (invalid creds); **5xx / timeout / bad shape → throw** (service
    error, distinct from bad creds). Returns
    `{ id, name, email, role, restaurantId, accessToken, refreshToken, accessTokenExpires }`.
  - `session: { strategy: "jwt", maxAge: 60*60*24*7 }` (= `JWT_REFRESH_TTL`),
    `pages: { signIn: "/admin/login" }`.
  - `callbacks.jwt` — first sign-in copies tokens/role/restaurantId into the
    token; else if the access token is near expiry, `POST /auth/refresh` and
    replace both; on failure set `token.error = "RefreshTokenError"`.
  - **`callbacks.session` — expose only `role`, `restaurantId`, `error`. NOT
    `accessToken`/`refreshToken`.**
  - `callbacks.authorized` — `!!auth && auth?.error !== "RefreshTokenError"`.
  - Module augmentation (`src/types/next-auth.d.ts`) for `Session`, `User`, `JWT`.
- `src/app/api/auth/[...nextauth]/route.ts` — `export const { GET, POST } = handlers`.
- **`src/proxy.ts`** — `export { auth as proxy } from "@/auth"` +
  `export const config = { matcher: ["/admin/:path*"] }`. (The signInPage guard
  in beta.32 lets `/admin/login` render without a loop.)
- `src/app/admin/login/page.tsx` — form → `signInAction` server action
  (`src/actions/auth.ts`) wrapping `signIn("credentials", …)`, mapping `AuthError`
  → friendly message (`{ success, error }`, shadcn form/input/button).

**Modified files:**
- `src/lib/api.ts` — add a server-only `authHeaders()` that reads the token from
  the encrypted cookie and attaches the Bearer:
  ```ts
  import { getToken } from "next-auth/jwt";
  import { headers } from "next/headers";
  import { redirect } from "next/navigation";
  async function authHeaders() {
    const token = await getToken({
      req: { headers: await headers() },
      secret: process.env.AUTH_SECRET,
      secureCookie: process.env.NODE_ENV === "production",
    });
    if (!token?.accessToken || token.error === "RefreshTokenError")
      redirect("/admin/login");
    return { Authorization: `Bearer ${token.accessToken as string}` };
  }
  ```
  Attach to **only the admin functions** (`getAdminReservations`,
  `getAdminTables`, `getAdminOrders`, `updateOrderStatus`, reservation
  confirm/complete/no-show/reschedule/assign, all menu CRUD, restaurant/settings/
  hours/blocked-period mutations). Public functions unchanged (they already omit
  `init.next`, so they stay `no-store`). *(Footgun to force-test:
  `getToken` returns `null` if `secureCookie`/`cookieName` don't match the running
  env — verify both dev and prod cookie names.)*
- `src/app/admin/layout.tsx` — `const session = await auth()`; pass `user`/`role`
  to `AdminShell`; keep the `noindex` robots meta.
- `src/components/admin/AdminShell.tsx` + `AdminNav.tsx` — signed-in name/role +
  a **Logout** button (server action → `signOut`).
- Role-gate the UI to match backend guards (backend stays source of truth): pass
  `role` into `ReservationActions`, `OrderActions`, and the menu panels — hide
  **menu management** from STAFF and **settings** from non-OWNER. UI gating is
  presentation only, done **last**.

---

## Verification

**Backend:** `npm run build`; `npm run test`. Unit: `AuthService` (argon2 verify
pass/fail, dummy-verify on unknown email, token sign/verify, refresh reissuance,
`type` claim rejection). E2e: login happy path; bad password → 401 (same message
+ ~same latency as unknown email); `GET /auth/me` without Bearer → 401; a
`@Roles(OWNER)` endpoint with a STAFF token → 403; **every currently-public admin
mutation (incl. business-hours + blocked-periods) → 401 without a token**; a
customer `@Public()` route (e.g. `POST /reservations`, `PATCH .../cancel`) still
200s; access token rejected at `/auth/refresh` and refresh token rejected as a
Bearer; login throttled after 5 attempts/min.

**Frontend:** `npm run build`. Both servers + owner seeded:
1. `/admin` unauthenticated → redirected to `/admin/login` (no loop).
2. Log in as OWNER → reach `/admin`; admin API calls carry the Bearer; mutations
   work. **Confirm `/api/auth/session` and page HTML contain NO NestJS token.**
3. Logout → `/admin` protected again.
4. STAFF user → menu management + settings hidden; backend 403 if forced.
5. Short `JWT_ACCESS_TTL` → next admin action still works via silent refresh;
   expired **refresh** → clean bounce to `/admin/login`, not a refresh loop.

## Workflow / risks

- Per `context/ai-interaction.md`: document in `current-feature.md`, branch
  `feature/authentication` in both repos, build must pass, **ask before
  committing**, merge + delete branch after.
- **Riskiest piece:** the `jwt`-callback silent refresh (expiry math, the
  `getToken` cookie-name footgun) — keep TTLs in env to force-test.
- **Default-deny makes the endpoint audit fail-safe**, but still eyeball the
  `@Public()` list once — a *missing* `@Public()` breaks a customer flow (caught
  by the e2e above); a *wrong* `@Public()` on an admin route is the only remaining
  way to leave one open.
- **Documented limitation:** stateless refresh cannot be revoked before `exp`;
  immediate forced-logout needs a future `RefreshSession` table (or a
  `User.isActive` flag) — out of scope for this MVP.
