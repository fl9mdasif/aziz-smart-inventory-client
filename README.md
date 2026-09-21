<div align="center">

# Aziz Brothers — Smart Inventory Client

**Public storefront + internal dashboard for Aziz Brothers' offline-sales inventory system**

![Next.js](https://img.shields.io/badge/Next.js-16-000000?logo=next.js&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?logo=typescript&logoColor=white)
![Redux Toolkit](https://img.shields.io/badge/Redux_Toolkit-RTK_Query-764ABC?logo=redux&logoColor=white)
![Tailwind](https://img.shields.io/badge/Tailwind-v4-06B6D4?logo=tailwindcss&logoColor=white)
![License](https://img.shields.io/badge/license-Proprietary-lightgrey)

</div>

---

## Overview

This is the Next.js (App Router) frontend for [`aziz-server`](../aziz-server). It has two audiences:

- **Anonymous visitors** — a public storefront (`/`) browsing what's currently in stock. No cart, no checkout, no payment — every sale still happens in person at the counter; the site exists to show availability, not to sell online.
- **Staff / admin / superAdmin** — a role-gated dashboard (`/dashboard/*`) for managing categories and products (with per-size variants), recording offline sales, tracking stock and restocks, and reviewing sales analytics and activity history.

> 📄 Requirements live in [`docs client/PRD-client.md`](<docs client/PRD-client.md>) and [`docs client/SOP-client.md`](<docs client/SOP-client.md>). [`AGENT.md`](AGENT.md) is a build-order planning doc from the early scaffolding phase (2026-09-16) — most of it is now built; treat it as history, not a live spec. This README documents the client as it actually stands today.

---

## Table of Contents

- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Getting Started](#getting-started)
- [How Auth Works](#how-auth-works)
- [Talking to the Server](#talking-to-the-server)
- [The Product + Variant Model](#the-product--variant-model)
- [Image Uploads](#image-uploads)
- [Roles & Route Guarding](#roles--route-guarding)
- [Dashboard Pages](#dashboard-pages)
- [Known Limitations](#known-limitations)
- [Contributing Conventions](#contributing-conventions)

---

## Tech Stack

| Layer | Choice |
|---|---|
| Framework | Next.js 16 (App Router), React 19 |
| Language | TypeScript (strict) |
| Styling | Tailwind CSS v4, shadcn/ui (Radix-based) components |
| State / data fetching | Redux Toolkit + RTK Query, with a custom **axios**-based `baseQuery` (not `fetchBaseQuery`) |
| Forms | react-hook-form + zod resolvers |
| Charts | Recharts |
| Image hosting | Cloudinary, uploaded via this app's own `/api/upload` route |
| Auth token storage | `localStorage` (see [How Auth Works](#how-auth-works)) |

---

## Project Structure

```
src/
├── app/
│   ├── page.tsx, layout.tsx        # public storefront home
│   ├── login/page.tsx              # login form
│   ├── (dashboard)/
│   │   ├── layout.tsx              # auth guard + Sidebar/Header shell for every /dashboard/* route
│   │   └── dashboard/
│   │       ├── page.tsx            # overview (KPIs + recent activity)
│   │       ├── category/           # category CRUD
│   │       ├── inventory/          # product + variant CRUD
│   │       ├── order/              # record a sale + orders table
│   │       ├── sales/              # analytics (revenue, top products, by category)
│   │       ├── low-stock/          # restock queue
│   │       ├── activity/           # activity feed
│   │       ├── users/              # staff account management (admin/superAdmin only)
│   │       └── settings/           # own profile + change password
│   └── api/upload/route.ts         # server-side Cloudinary upload proxy (keeps the API secret off the client)
├── components/
│   ├── public/                     # storefront-only components (Hero, ProductCard, Header/Footer, …)
│   ├── dashboard/                  # dashboard-only components (forms, tables, charts, KPI cards)
│   ├── layout/                     # Sidebar, Header (dashboard shell)
│   ├── shared/                     # DataTable, StatusBadge, RoleGate, ConfirmDialog, PageHeader, ComboboxAddNew
│   └── ui/                         # shadcn/ui primitives
├── redux/
│   ├── api/                        # one RTK Query file per server module (baseApi, authApi, categoryApi, productApi, orderApi, userApi, activityApi)
│   ├── tag-types.ts                # cache-invalidation tags shared across api files
│   └── store.ts / rootReducer.ts / reduxProvider.tsx / hooks.ts
├── helpers/axios/                  # axiosInstance (attaches Bearer token) + axiosBaseQuery (adapts it for RTK Query)
├── services/
│   ├── auth.services.ts            # localStorage token read/write, decode, isLoggedIn
│   └── ImageUploader.tsx           # client-side compress + POST to /api/upload
├── hooks/                          # useCurrentUser, useDebouncedValue
├── contains/                       # authKey ("accessToken"), role.ts (USER_ROLE — must mirror the server exactly)
├── utils/                          # drawerItems (sidebar config), interface.ts (zod schemas), jwt, local-storage, slugify, modifyPayload
└── types/common.ts                 # every shared type: TProduct, TVariant, TOrder, TUser, TActivity, API envelope types, …
```

Every server module (`category`, `product`, `order`, `user`, `activity`, `auth`) has a matching `src/redux/api/<name>Api.ts` file built with `baseApi.injectEndpoints`, and every server response type has a matching type in `src/types/common.ts`. When the server's contract changes, update the type first, then the api file, then the components that consume it — in that order.

---

## Getting Started

### Prerequisites

- Node.js 18+
- The [`aziz-server`](../aziz-server) API running (defaults to `http://localhost:5000/api/v1`)
- A Cloudinary account (cloud name + API key/secret) for image uploads

### Installation

```bash
npm install
```

### Environment Variables

Create `.env.local`:

| Variable | Required | Description |
|---|:---:|---|
| `NEXT_PUBLIC_BACKEND_API_URL` | ✅ | Base URL of the server API, e.g. `http://localhost:5000/api/v1` |
| `CLOUDINARY_CLOUD_NAME` | ✅ | Used server-side only, by `app/api/upload/route.ts` |
| `CLOUDINARY_API_KEY` | ✅ | Server-side only — never exposed to the browser |
| `CLOUDINARY_API_SECRET` | ✅ | Server-side only — never exposed to the browser |

### Running

```bash
npm run dev      # Next.js dev server, http://localhost:3000
npm run build    # production build
npm start        # run the production build
npm run lint     # eslint
```

---

## How Auth Works

**Read this before touching login/token code.** The server's `auth` middleware reads the JWT strictly from the `Authorization` header — it also sets httpOnly cookies on login, but nothing server-side ever reads them back. So the working pattern here is entirely header-based:

1. `POST /auth/login` returns an access token in the response body.
2. `auth.services.ts`'s `storeUserInfo` saves it to `localStorage` under the key in `contains/authKey.ts` (`"accessToken"`).
3. `helpers/axios/axiosInstance.ts` reads it from `localStorage` on every request and attaches `Authorization: <token>` (raw JWT, no `Bearer ` prefix — matches the server's expectation).
4. `useCurrentUser()` decodes the stored token (via `jwt-decode`) to get `{ username, role, ... }` for the UI; `(dashboard)/layout.tsx` redirects to `/login` if there's no valid token.
5. Logout calls the logout mutation, then `removeUser()` clears `localStorage`, then redirects to `/login`.

Do not switch this to a cookie-based flow without first changing the server's `auth` middleware to also read `req.cookies.accessToken` — right now that cookie is dead weight.

---

## Talking to the Server

RTK Query endpoints don't use `fetchBaseQuery` — they go through `helpers/axios/axiosBaseQuery.ts`, a thin adapter around the shared `axiosInstance`. Two things this unwraps that you should know about:

- **The envelope is already stripped.** The server wraps every response as `{ success, statusCode, message, data, meta? }`; `axiosBaseQuery` returns `response.data` as RTK Query's `data`, so an endpoint's `query()` return value corresponds to the server's `data` field, not the full envelope.
- **Paginated lists are double-nested.** For list endpoints the server's `data` field is itself `{ meta, data }` (see the doc comment on `TPaginatedList` in `types/common.ts`). Endpoints like `getAllProducts`/`getAllOrders`/`getRecentActivities` use `transformResponse` to flatten this into `{ items, meta }` — consume that shape from components, don't reach for a raw array, and drive any list's pager off `meta` with `components/shared/Pagination.tsx` rather than hand-rolling prev/next state per page.

Cache invalidation is tag-based (`redux/tag-types.ts`): mutations declare `invalidatesTags`, queries declare `providesTags`. Recording an order invalidates `orders`, `products`, and `activity` together, which is how the dashboard KPI cards and stock numbers update without a manual page refresh after a sale — don't work around a missing refresh with `window.location.reload()`; fix the tags instead.

---

## The Product + Variant Model

The server models a product as identity/commercial fields (`modelNo`, `name`, `category`, `brand`, …) plus a `variants[]` array — one entry per sellable size, each carrying its own `sku`, `thickness`/`width`/`length`, `sizeLabel`, `price`, `stockQuantity`, `minStockThreshold`, and `status`. The client mirrors this exactly in `types/common.ts` (`TProduct` / `TVariant` / `TVariantInput`):

- **`sku`, `sizeLabel`, and `status` are always server-derived** — never render them as editable form fields, and never send them in a create/update payload.
- Editing a single size's price or stock goes through `useUpdateVariantMutation()` (`PATCH /products/:productId/variants/:variantId`), not a full-product resave — see `productApi.ts`.
- The **public storefront never sees variants directly**: `GET /products` for an anonymous caller returns `TPublicProduct`, a rolled-up shape with a single `price` and an overall `availability` computed across all of a product's variants. Only an authenticated dashboard session gets the full `TProduct` with its `variants[]`.
- `GET /products/meta` (public, no query params) returns the distinct `brand`/`transportPackage`/`origin` values already in use across the catalog — feeds `ComboboxAddNew`, a searchable select that also lets an admin type a brand-new value instead of being locked to an enum.
- Recording a sale (`OrderForm` → `useCreateOrderMutation()`) requires **both** `productId` and `variantId` — a sale is always "this product, in this specific size."

---

## Image Uploads

Product/category thumbnails go through this app's own `POST /api/upload` route (`app/api/upload/route.ts`), which proxies to Cloudinary using server-side-only env vars — the Cloudinary API secret never reaches the browser. `services/ImageUploader.tsx` handles the client side: it canvas-compresses the selected image down toward ~100 KB before uploading, shows a preview + final size, and calls back with the resulting Cloudinary URL, which is what actually gets saved on the product/category record (the server itself only ever stores a URL string — see `aziz-server`'s README).

---

## Roles & Route Guarding

`contains/role.ts`'s `USER_ROLE` must mirror the server's role strings exactly (`staff` / `admin` / `superAdmin`, camelCase, no underscore) — a client/server mismatch here has broken role checks before.

- `utils/drawerItems.ts` builds the sidebar per role: `General` / `Tracking` / `Management` groups (these labels are deliberate — don't relabel them), with **User Management** only added for `admin`/`superAdmin`.
- `<RoleGate allow={[...]}>` (`components/shared/RoleGate.tsx`) hides create/edit/delete controls from `staff` on pages they can otherwise view read-only (Category, Inventory, Orders' cancel action). It never hides an entire page staff should still see.
- **This is UX polish only, not a security boundary.** The server enforces real permissions independently; any restricted action must still be verified against a live 403 from the API, not just a hidden button.
- `/dashboard/users` is guarded both in the sidebar (not rendered for staff) and should redirect-guard the route itself, since a staff user can still type the URL directly.

---

## Dashboard Pages

| Route | Purpose | Notes |
|---|---|---|
| `/dashboard` | KPI overview | Total products, low-stock count, today's sales, this month's revenue, top products + recent activity (both capped at 10, no pager) |
| `/dashboard/category` | Category CRUD | `admin`/`superAdmin` only for mutations |
| `/dashboard/inventory` | Product + variant CRUD | Search/filter/paginate; `ProductFormDialog` manages a product and its `variants[]` together |
| `/dashboard/order` | Record a sale + orders table | `OrderForm` (searchable product/size combobox) + `OrdersTable` (paginated, 10/page; cancel gated to admin/superAdmin) |
| `/dashboard/sales` | Analytics | Revenue chart by period, top products (capped at 10), revenue by category — hits only `/orders/analytics/*`, no bespoke endpoints; visible to `staff` too (read-only) |
| `/dashboard/low-stock` | Restock queue | One row per undersupplied **size** (variant), server-sorted by urgency — don't re-sort client-side |
| `/dashboard/activity` | Activity feed | Server-paginated (10/page), filterable by type (`order`/`product`/`user`/`system`) |
| `/dashboard/users` | Staff account management | Hidden for `staff`; role select disables promoting to `admin` unless the current user is `superAdmin` |
| `/dashboard/settings` | Own profile + password | Same for every role, no `RoleGate` |

---

## Known Limitations

- **No automated test suite yet.** Verify changes by running the dashboard against a live `aziz-server` instance and checking each role's actual behavior (not just what's hidden in the UI).
- **No dedicated route-guard middleware** for `/dashboard/*` — the guard lives in `(dashboard)/layout.tsx` and runs client-side after the token is read from `localStorage`, which means a not-logged-in visitor briefly renders nothing before the redirect rather than being blocked at the edge.
- **Sales page math is client-computed.** Totals/averages on `/dashboard/sales` are `reduce`d client-side from the analytics endpoints' responses — this is a deliberate constraint (no new endpoint for it), not an oversight.

---

## Contributing Conventions

- Before adding client code for a server endpoint, confirm the actual response shape against the running server — don't assume from the route name (see the [`AGENT.md`](AGENT.md) history section for examples of exactly this kind of drift causing bugs).
- Add a type in `types/common.ts` before wiring the RTK Query endpoint that returns it.
- Never accept `sku`, `sizeLabel`, `status`, or product `availability` as user input — these are always server-derived.
- Keep `contains/role.ts` in lockstep with the server's `USER_ROLE` — if the server adds or renames a role, update this file in the same change.
- Keep this README in sync with what's actually built; update it as part of the change, not as an afterthought.

---

<div align="center">

Internal project — Aziz Brothers. Not for public distribution.

</div>
