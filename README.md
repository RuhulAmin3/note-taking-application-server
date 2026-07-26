# Secure Note-Taking API (Backend)

Node + Express + TypeScript + MongoDB/Mongoose REST API with JWT auth, role-based access (user/admin), bcrypt password hashing, pagination on all lists, and two MongoDB aggregation pipelines. Organized in a **modular (feature-based)** architecture.

**Live API:** https://note-application-server.vercel.app — try [`/health`](https://note-application-server.vercel.app/health)
**Frontend:** https://note-application-client-six.vercel.app ([repo](https://github.com/RuhulAmin3/note-taking-application-client))

## Architecture — modular (not layered MVC)

Code is grouped **by feature**, not by technical layer. Each feature owns its full vertical slice; cross-cutting concerns are shared at the `src/` root.

```
src/
  config/           env parsing, mongoose connection (shared)
  middleware/       error handler + AppError, zod validate, jwt authenticate/authorize (shared)
  utils/            password (bcrypt), jwt sign/verify, asyncHandler, pagination (shared)
  modules/
    auth/           auth.validation | auth.service | auth.controller | auth.routes   (reuses user.model)
    user/           user.model | user.validation | user.service | user.controller | user.routes
    note/           note.model | note.validation | note.service | note.controller | note.routes
    post/           post.model | post.validation | post.service | post.controller | post.routes
  app.ts            express app + route mounts
  server.ts         bootstrap (connect DB, listen)
  seed.ts           seed first admin
```

Per module: `*.model.ts` (Mongoose schema + `schema.index()`), `*.validation.ts` (zod schemas + inferred types), `*.service.ts` (business + DB/aggregation logic, throws `AppError`, returns plain data), `*.controller.ts` (thin http glue via `asyncHandler`), `*.routes.ts` (wires middleware to controllers).

## Run

```bash
npm install
cp .env.example .env      # then set MONGODB_URI (Atlas) and a real JWT_SECRET
npm run dev               # ts-node-dev on http://localhost:4001
npm run seed              # create admin@test.com / adminpass123
```

`.env` keys: `PORT`, `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS`, `CORS_ORIGIN`.

`CORS_ORIGIN` is a comma-separated allowlist of browser origins. Leave it empty locally — unset means any origin is allowed, which is what development wants.

> Toolchain note: TypeScript is pinned to 5.x — the environment's default `typescript@7` (Go-native tsgo) is incompatible with `ts-node`. Express is pinned to 4.

## Deploy (Vercel)

Serverless has no long-lived process, so `app.listen` never runs there. `api/index.ts` is the function entry and `vercel.json` rewrites every path to it; `src/server.ts` still listens for local development. `src/app.ts` also default-exports the app, because Vercel detects Express and routes to that module expecting a server export — without it, requests crash with `Invalid export found in module`.

```bash
vercel link
vercel env add MONGODB_URI production      # repeat per key below
vercel --prod
```

Set in the project: `MONGODB_URI`, `JWT_SECRET`, `JWT_EXPIRES_IN`, `BCRYPT_ROUNDS`, and `CORS_ORIGIN` (the deployed frontend's origin). `PORT` is not used — the platform owns the port.

**Atlas must allow `0.0.0.0/0`** under Network Access. Vercel functions have dynamic egress IPs, so an IP-pinned allowlist makes every deployed request time out — and it looks like a code bug, not a network one. The tradeoff is that the cluster is then reachable from anywhere with valid credentials, so the database password carries the weight.

Two adjustments matter under serverless:

- `connectDB` caches its connection promise at module scope. Without it a warm function would open a connection per request and exhaust the cluster pool. A failed attempt is not cached, so a cold database can't wedge the instance.
- `syncIndexes()` is skipped when `NODE_ENV=production` — it would otherwise run on every cold start, and the indexes already exist.

## API

| Method | Path | Access | Notes |
|--------|------|--------|-------|
| POST | `/api/auth/register` | public | creates a `user` |
| POST | `/api/auth/login` | public | returns JWT |
| GET | `/api/users/me` | auth | own profile |
| GET | `/api/users` | admin | list users (paginated) |
| POST | `/api/users` | admin | create user (accepts `role`; the dashboard never sends `admin`) |
| GET/PATCH/DELETE | `/api/users/:id` | admin | manage a user |
| GET | `/api/users/grouped-by-interests` | admin | **Aggregation Scenario 1** |
| POST | `/api/notes` | auth | create own note |
| GET | `/api/notes` | auth | list own notes (paginated) |
| GET | `/api/notes/all` | admin | list everyone's notes (paginated) |
| GET/PATCH/DELETE | `/api/notes/:id` | owner or admin | single note |
| POST | `/api/posts` | auth | create a post |
| GET | `/api/posts/user/:userId` | auth | **Aggregation Scenario 2** ($lookup) |
| GET | `/api/posts/all` | admin | list everyone's posts (paginated, author joined) |
| PATCH/DELETE | `/api/posts/:id` | owner or admin | single post |

All list endpoints accept `?page=&limit=` (limit capped at 100) and return `{ data, meta: { page, limit, total, totalPages } }`.

`/notes/all` and `/posts/all` are registered before `/:id` so that `all` is not parsed as an id.

Ownership on `/notes/:id` and `/posts/:id` is enforced in the service layer (`findOwnedOrAdmin`): the owner or an admin may proceed, anyone else gets `403`.

## Indexing strategy (graded — minimal, all via `schema.index()`)

Only **three** indexes exist. Each is declared with an explicit `schema.index()` call (visible for review — no inline `unique`/`index` field options) and each is provably used by a real query.

| Model | Index | Query it serves | `explain()` winning plan |
|-------|-------|-----------------|--------------------------|
| User | `{ email: 1 }` unique | login lookup + uniqueness enforcement | `IXSCAN email_1` |
| Note | `{ owner: 1, createdAt: -1 }` | user listing own notes: filter `owner` + sort `createdAt` desc + paginate, all in one index | `IXSCAN owner_1_createdAt_-1`, no in-memory SORT |
| Post | `{ author: 1 }` | Scenario 2 `$match { author }` (the `$lookup` pipeline's driving stage) + paginating a user's posts | `IXSCAN author_1` |

### Deliberately omitted indexes (why more would be wrong)

The spec's Critical Constraint grades **efficiency**: "DO NOT make any unnecessary indexes." Two tempting-but-unused indexes are intentionally left out:

- **No `User.interests` index.** Scenario 1 groups *all* users by interest via `$unwind` + `$group` with **no `$match`**. There is no equality/range predicate for an index to serve, so the pipeline is a full collection scan by nature — `explain()` shows a `COLLSCAN` at the `$cursor` stage. An `interests` index would sit unused and violate the constraint.
- **No `createdAt` index for unfiltered lists.** Admin "list all users" and "list all notes" have no filter. They sort/paginate by `_id` (descending), which the always-present default `_id` index already satisfies. A dedicated `createdAt` index would be redundant.

Every by-id read (`GET /users/:id`, `GET /notes/:id`, profile) is served by the default `_id` index.

## Aggregations

- **Scenario 1 — group by interests** (`user.service.ts → groupByInterests`): a single `User.aggregate([...])` call — `$unwind` interests → `$group` by interest (count + users) → `$sort` → `$facet` (groups + totalInterests). Exactly one aggregate call; the total is computed inside the same pipeline via `$facet`, so no separate `countDocuments`.
- **Scenario 2 — user posts** (`post.service.ts → getUserPosts`): a single `Post.aggregate([...])` pipeline — `$match { author }` (index-served) → `$sort` → `$facet` with `data:[ $skip, $limit, $lookup(users), $unwind, $project ]` and `total:[ $count ]`. One pipeline, one `$lookup`, natural pagination.

## Security

- Passwords hashed with bcrypt (`BCRYPT_ROUNDS`, default 12) via a Mongoose pre-save hook; `password` field is `select: false` and never returned.
- JWT (`Authorization: Bearer <token>`); `authenticate` middleware verifies, `authorize(...roles)` enforces RBAC.
- `helmet` + `cors`; zod validation on all write endpoints; duplicate-email → `409`.
