---
title: PRD - Aziz Brothers Smart Inventory Management System (Client)
stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Redux Toolkit/RTK Query
scope: public homepage + internal dashboard
companion: aziz-inventory-prd-server.md (data/API contract lives there)
---

# PRD: Aziz Brothers Smart Inventory Management System (Client) — v2.0

Two audiences, two surfaces in one app: an anonymous visitor sees a read-only "what's in stock" homepage, a logged-in staff/admin/superAdmin sees the internal dashboard. Reference style images the owner shared (a generic "Invendor" SaaS admin template) are inspiration for visual polish only, not a feature spec, do not build Shopee/Tokopedia/TikTok Shop channel widgets, multi-payment-gateway breakdowns, or anything else that isn't in this PRD's nav below.

## 1. Public homepage

**Purpose**: show anonymous visitors what's currently available so they come buy it in person. No cart, no account, no checkout, anywhere on this page. Clear "offline sale" framing, e.g. "Available now, visit us to purchase" rather than an "Add to cart" button.

- Header: logo, business name, contact info (phone/WhatsApp/address), no login-gated nav items shown
- Product grid: pulls from `GET /products` (public shape), each card shows thumbnail, name, category, price, and an availability badge (In Stock / Low Stock / Out of Stock, derived from the server's `status` field, styled distinctly, e.g. out-of-stock cards visibly greyed/disabled)
- Category filter/browse (from `GET /categories`)
- Search box (client-side query param into `GET /products?search=`)
- A simple "How to buy" section explaining the offline process (visit the shop / call / WhatsApp), since there's no online purchase flow at all
- Footer: address, phone, business hours

No 3D scene, no heavy animation system here, this is a functional stock-visibility page for a wholesale/distribution business, not a consumer aspirational brand. Keep it fast and simple: real product photos (or a clean placeholder if a product has none), clear pricing, clear availability.

## 2. Internal dashboard — navigation (exact structure per the owner)

```
General
  - Dashboard
  - Category
  - Inventory / Product

Tracking
  - Order
  - Sales tracking
  - Low Stock Quantity
  - Inventory Activity

Management
  - User Management
  - Settings
```

Sidebar grouped into these three sections (General / Tracking / Management), matching the owner's own naming exactly, this is deliberate and should not be relabeled or reorganized.

### 2.1 Dashboard (General)

Pure aggregation view, no dedicated backend endpoint (per server PRD §4). Pull from: `GET /products` (total count, low-stock count via `restock-queue`), `GET /orders/analytics/sales?period=daily` (today's/this-month's revenue and order count), `GET /activity` (recent activity feed, last 5-10 entries). Layout: 3-4 KPI cards at top (Total Products, Low Stock Count, Today's Sales, This Month's Revenue), a small recent-activity list below.

### 2.2 Category

Table/grid of categories with active/inactive toggle, create/edit modal, delete (admin/superAdmin only per the server's role gate — staff sees the list but action buttons are hidden/disabled for staff).

### 2.3 Inventory / Product

Table of products: search, filter by category/status, columns for name, category, price, stock quantity, status badge. Create/edit form (admin/superAdmin only), staff has read-only access here. Status badge colors: active=green, low_stock=amber, out_of_stock=red, matching the server's auto-managed `status` field, don't let the client set `status` directly, it's derived server-side from stock quantity.

### 2.4 Order (Tracking)

This is where staff/admin record a sale. Form: pick product (searchable dropdown, shows current stock), quantity, optional discount, optional customer name/contact, optional note. On submit, calls `POST /orders`. Below the form, a table of recorded orders (search/filter by status/date, paginated). A "Cancel" action is visible only to admin/superAdmin (per server role gate), staff can view but not cancel their own or others' recorded sales.

### 2.5 Sales (Tracking) — client-side only, no dedicated backend module

This is a pure visualization layer over the three `/orders/analytics/*` endpoints (server PRD §6.2). Build:

- A period toggle: Daily / Weekly / Monthly / Yearly, driving `GET /orders/analytics/sales?period=`
- A revenue-over-time line/bar chart
- A "Top Products" panel from `GET /orders/analytics/top-products`
- A "By Category" breakdown from `GET /orders/analytics/by-category`
- Simple summary numbers (total revenue, total orders, average order value) computed client-side from the returned data, not a separate summary endpoint

Do not add a `/sales` API client call to any endpoint outside `/orders/analytics/*` — if a chart needs data the analytics endpoints don't return, that's a signal to extend those endpoints (server PRD §6.2), not to invent a new one on the client.

### 2.6 Low Stock Quantity (Tracking)

Table from `GET /products/restock-queue`, sorted by urgency (already server-side). Highlight out-of-stock rows distinctly from low-stock rows. Optional "dismiss from queue" action wired to the existing `restockIgnored` flag if the owner wants it exposed (server already supports it, client doesn't have to build it in v1 if not needed).

### 2.7 Inventory Activity (Tracking)

Simple reverse-chronological feed from `GET /activity` (existing endpoint), filterable by type (order/product/system), each entry shows its message and timestamp, paginated.

### 2.8 User Management (Management)

Admin/superAdmin only (hide this entire nav item for staff). Table of staff/admin accounts, create new staff (admin/superAdmin can create staff, only superAdmin can create/promote to admin), deactivate toggle. Never show password fields for existing users, only a "reset password" action if the owner wants one (not required for v1, can be a manual admin task via the change-password flow if the account holder is present).

### 2.9 Settings (Management)

Every logged-in role sees their own: profile update form (username, email, contact number), change-password form (current password + new password, confirm). Calls `/auth/update-profile` and `/auth/change-password` per the server PRD.

## 3. Role-based UI behavior

Don't build separate apps per role, build one dashboard shell and hide/disable per the same permission map the server enforces:

| Nav item | Staff sees | Admin/SuperAdmin sees |
|---|---|---|
| Dashboard | ✅ | ✅ |
| Category | ✅ view, create/edit/delete disabled | ✅ full |
| Inventory/Product | ✅ view, create/edit/delete disabled | ✅ full |
| Order | ✅ full (can create, cannot cancel) | ✅ full |
| Sales | ✅ (or admin-only, owner's call — default to visible to staff too since it's read-only) | ✅ |
| Low Stock Quantity | ✅ view | ✅ view |
| Inventory Activity | ✅ view | ✅ view |
| User Management | ❌ hidden | ✅ (role-promotion to admin: superAdmin only) |
| Settings | ✅ (own profile only) | ✅ (own profile only) |

Never rely on hiding a button as the only protection, the server enforces the real permission check (server PRD §6.1), the client hiding is purely UX polish so staff don't see controls that would 403 anyway.

## 4. Design direction

Functional, clean, data-dense where it needs to be (tables, charts), not a marketing site. A neutral, professional palette (avoid the generic AI purple/indigo default), clear status-color conventions used consistently everywhere (green=good/active, amber=low/warning, red=out-of-stock/cancelled), shadcn/ui components for tables/forms/modals so the internal dashboard doesn't need bespoke component work. The public homepage can be slightly warmer/more inviting than the dashboard, but still simple and fast, this is a stock-visibility page, not a hero-animation showcase.

## 5. Acceptance checklist

- [ ] Public homepage shows real product data, no login required, no purchase/cart affordance anywhere
- [ ] Dashboard nav matches the exact General/Tracking/Management structure and labels above
- [ ] Order form successfully records a sale and the product's stock/status updates without a page refresh
- [ ] Sales page renders from `/orders/analytics/*` only, verified by checking the network tab, no other endpoint touched
- [ ] Staff cannot see or trigger category/product delete, order cancel, or User Management, verified by logging in as a seeded staff account, not just by reading the code
- [ ] Low Stock Quantity page correctly separates low-stock from out-of-stock
- [ ] Settings: profile update and change-password both work end to end
- [ ] Responsive at 320px, 768px, 1024px, 1440px (staff will likely use this on a phone in the shop)
