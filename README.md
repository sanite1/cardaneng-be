# Cardan Engineering — Backend API

REST API that powers the **Projects**, **Products** and **News** content shown on
the Cardan Engineering website and managed through its `/admin` dashboard.

- **Stack:** Node.js · Express · TypeScript · MongoDB (Mongoose)
- **Companion frontend:** the [`cardaneng`](../cardaneng) project (React). Its
  admin currently uses an in-browser mock; pointing it at this API is the next
  integration step.

## Current status

A **working scaffold**: all CRUD endpoints, JWT admin auth, models, seed script
and config are in place and type-check cleanly. It has **not yet** been run
against a live MongoDB instance or connected to the frontend — that's the
Roadmap below.

## Getting started

```bash
npm install
cp .env.example .env      # then edit values
npm run dev               # starts on http://localhost:4000 with auto-reload
```

You need a MongoDB connection string in `.env` (`MONGODB_URI`). For production,
create a free **MongoDB Atlas** cluster and use its `mongodb+srv://…` URI.

Optionally load starter content:

```bash
npm run seed
```

## Scripts

| Script | Purpose |
| --- | --- |
| `npm run dev` | Run in watch mode (tsx) |
| `npm run build` | Compile TypeScript to `dist/` |
| `npm start` | Run the compiled server |
| `npm run seed` | Populate the database with starter content |
| `npm run typecheck` | Type-check without emitting |

## API

Base URL: `/api`

| Method | Path | Auth | Description |
| --- | --- | --- | --- |
| POST | `/auth/login` | – | Returns a JWT for the admin (bcrypt-verified) |
| GET | `/auth/me` | Bearer | Current admin (validate session) |
| POST | `/auth/change-password` | Bearer | Change the signed-in admin's password |
| POST | `/contact` | – | Contact form: saves the message, emails the company + a confirmation to the sender |
| GET | `/messages` · `/messages/:id` | Bearer | Read stored contact enquiries (admin) |
| PUT / DELETE | `/messages/:id` | Bearer | Mark handled / delete an enquiry |
| POST | `/uploads` | Bearer | Upload an image (multipart `file`) to Cloudinary, returns `{ url, publicId }` |
| GET | `/projects` · `/products` · `/news` | – | List (public) |
| GET | `/:resource/:id` | – | Read one |
| POST | `/:resource` | Bearer | Create |
| PUT | `/:resource/:id` | Bearer | Update |
| DELETE | `/:resource/:id` | Bearer | Delete |
| GET | `/health` | – | Liveness check |

Reads are public (the website needs them); writes require
`Authorization: Bearer <token>` from `/auth/login`.

Documents are returned with a string `id` (not `_id`) and numeric
`createdAt` / `updatedAt`, so they drop straight into the frontend's existing
`Repo<T>` types.

## Email deliverability

For the contact-form emails to land in inboxes (not spam), the sending domain
needs **SPF, DKIM and DMARC** DNS records. See
[`docs/email-deliverability.md`](docs/email-deliverability.md) for the exact
records and a provider-by-provider guide.

## Roadmap — what we are building next

1. **Stand it up.** Create a free **MongoDB Atlas** cluster, put its URI in
   `.env`, run `npm run dev` and `npm run seed`, and verify the endpoints
   (health, login, list/create/update/delete) against real data.
2. **Connect the frontend.** Swap the frontend's mock repos
   (`cardaneng/src/lib/content/store.ts`) for `fetch()` calls to this API and
   store the JWT from `/api/auth/login`. Response shapes already match the
   frontend types, so the admin UI is untouched.
3. **Image uploads — done (Cloudinary).** `POST /api/uploads` streams files to
   Cloudinary and returns the hosted URL. Add your `CLOUDINARY_*` keys to `.env`.
4. **Harden auth — mostly done.** Logins now verify against a `Users` collection
   with **bcrypt** hashes (seeded once from `ADMIN_USER`/`ADMIN_PASS`), with
   `/auth/me` and `/auth/change-password`. Still open: the frontend stores the
   JWT in `localStorage` (XSS-exposed). Moving to httpOnly cookies is the next
   step but needs same-origin or cross-site cookie config — a deploy decision.
5. **Validation & polish.** Rate limiting (contact + login) and contact-form
   spam protection — **done** (honeypot + rate limit always on; Cloudflare
   Turnstile when `TURNSTILE_SECRET` is set). Still to add: request validation
   (zod) and request logging.
6. **Deploy.** Host on a Node platform (Render/Railway/Fly/VPS) with Atlas, set
   `CORS_ORIGIN` to the live site, and point the frontend at the deployed URL.

## Deployment note

MongoDB + Node **cannot run on the client's cPanel** shared hosting (PHP only).
Deploy this API to a Node host (Render, Railway, Fly.io, or a VPS) with a
MongoDB Atlas database. The static frontend can still be hosted on cPanel — just
point it at the deployed API URL via `CORS_ORIGIN` here and the API base URL there.

## Auth

Logins are verified against a `Users` collection with **bcrypt-hashed**
passwords. On a fresh database, one admin is seeded from `ADMIN_USER` /
`ADMIN_PASS` (then those env vars are ignored). Change the password via
`POST /api/auth/change-password`, and add more admins by inserting `User`
documents. Tokens are JWTs (`JWT_EXPIRES`, default 7d); login and contact are
rate-limited.
