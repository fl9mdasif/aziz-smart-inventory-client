# Agent Plan — Aziz Brothers Smart Inventory (Client)

Source docs: `../docs client/PRD-client.md`, `../docs client/SOP-client.md`. Server contract: `../aziz-server/SERVER-ARCHITECTURE.md`. Server runs on `PORT=5000`, base path `/api/v1` (see `aziz-server/.env` and `aziz-server/src/app/routes/index.ts`).

Stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Redux Toolkit / RTK Query (via a custom axios `baseQuery`, not `fetchBaseQuery`).

**Status: scaffolding already exists** (Next.js app + Redux/RTK Query data layer). This doc reflects the current real state, not a from-scratch plan — read §1 before adding new API code.

## 1. What's already built (as of 2026-09-16)

```
src/
  app/                          # default create-next-app page/layout, not yet built out
  contains/
    authKey.ts                  # "accessToken" — localStorage key
    role.ts                     # USER_ROLE.{STAFF,ADMIN,SUPER_ADMIN} = staff/admin/superAdmin
  helpers/axios/
    axiosInstance.ts            # axios instance, attaches Bearer token from localStorage, unwraps {data,meta}
    axiosBaseQuery.ts           # adapts axiosInstance into an RTK Query baseQuery
  redux/
    api/
      baseApi.ts                # createApi root, tagTypes wired
      authApi.ts                # login, register, getMe, updateProfile, changePassword, logout
      categoryApi.ts            # full CRUD
      productApi.ts             # full CRUD + getRestockQueue
      orderApi.ts               # create/list/getById/cancel/delete + 3 analytics endpoints
      activityApi.ts            # getRecentActivities (GET /activity)
      userApi.ts                # createStaff/getAllUsers/getUserById/updateUser/deactivateUser
    tag-types.ts                # users, orders, products, categories, activity
    store.ts / rootReducer.ts / reduxProvider.tsx / hooks.ts
  services/
    auth.services.ts            # storeUserInfo/getUserInfo/isLoggedIn/removeUser (localStorage + jwt-decode)
    ImageUploader.tsx            # client-side compress + upload to imgBB, returns a URL string
  types/common.ts                 # TCategory, TProduct, TOrder, TActivity, TUser, DrawerItem, UserRole
  utils/
    interface.ts                 # zod schemas: UserRegSchema, loginSchema, changePasswordSchema, updateProfileSchema
    drawerItems.ts                # sidebar item list per PRD §2, role-filtered
    jwt.ts / local-storage.ts / modifyPayload.ts
```

**Auth mechanism — read this before touching login/token code**: the server's `auth` middleware reads the JWT strictly from the `Authorization` header. It never reads the httpOnly cookies the login controller also sets — those cookies are dead code server-side. So the working pattern here is: store the access token from the login response in `localStorage` (`authKey`), attach it as `Authorization` on every request (already wired in `axiosInstance.ts`). Do not try to switch this to a cookie-based flow without first changing the server's `auth` middleware to also check `req.cookies.accessToken`.

Corrected during review (2026-09-16), so don't reintroduce these:
- `role.ts` previously used `"super_admin"` and was missing `staff` — server's actual values are `staff` / `admin` / `superAdmin` (camelCase, no underscore).
- `activityApi` was calling `/activities` (plural) — the server route is `/activity` (singular).
- `orderApi`'s cancel action was patching a nonexistent `/orders/:id/status` — the real route is `/orders/:id/cancel`.
- `TOrder` previously modeled a multi-step shipping/delivery lifecycle (`shippingAddress`, `statusHistory`, `orderStatus: pending|confirmed|shipped|...`) — the server models an order as a single offline-sale record with `status: 'completed' | 'cancelled'` only, snapshotted `unitPrice`/`productName`, optional `customerName`/`customerContact`/`note`.
- `getUserInfo()` was lowercasing the decoded role (`"superAdmin"` → `"superadmin"`), which broke every `=== USER_ROLE.SUPER_ADMIN` check.
- Removed `services/actions/{login,logout,register}User.ts` — leftover Next.js server actions from an unrelated prior project that set a `"session"` cookie nothing on the server reads; they conflicted with the working `localStorage` + `Authorization` header flow above.
- `userApi.ts` was an empty file; `authApi.ts` didn't exist yet — both built out now.

## 2. Build order (per SOP, still applies)

1. Public homepage (`GET /products`, `GET /categories`) — no auth, validates API connection.
2. Auth: login form using `authApi`'s `useLoginMutation`, store the token via `auth.services.ts`, route-guard `/dashboard/*`.
3. Dashboard shell: sidebar via `drawerItems.ts` (exact General/Tracking/Management grouping, do not relabel), role-aware hiding per PRD §3.
4. Dashboard pages, in this order: Category → Inventory/Product → Order → Low Stock Quantity + Inventory Activity → Sales → User Management → Settings.
5. Before building Sales, re-verify the actual `/orders/analytics/*` JSON shape against the running server — the three endpoints exist in `orderApi.ts` now, but confirm field names before charting.

## 2a. Dashboard build guide (page-by-page)

Everything below lives under `src/app/(dashboard)/dashboard/...` (one route group, shared layout). Route guard + role-gating happens once in the group's `layout.tsx`, not per page.

### Shared shell (build this first, before any page)

- `src/app/(dashboard)/layout.tsx` — server component. Reads the token (via a client-side check, since the token lives in `localStorage`, not a cookie — see §1 auth note), renders `<Sidebar />` + `<Header />` + `{children}`. If no token, redirect to `/login`.
- `src/components/layout/Sidebar.tsx` — client component. Maps `drawerItems(role)` from `utils/drawerItems.ts` into three headed groups (`General`/`Tracking`/`Management`), active-route highlight via `usePathname()`. Collapsible/off-canvas below 768px (use shadcn `Sheet`).
- `src/components/layout/Header.tsx` — page title (derive from route or pass via props), user menu (avatar, role badge, logout button calling `useLogoutMutation` + `removeUser()` + redirect to `/login`).
- `src/components/shared/RoleGate.tsx` — small wrapper: `<RoleGate allow={['admin','superAdmin']}>{children}</RoleGate>`, renders nothing (or a disabled/tooltip variant) if the current role isn't in `allow`. Get current role from `getUserInfo()` (`services/auth.services.ts`). Used to hide create/edit/delete buttons per PRD §3 — never to hide entire pages that staff should still view read-only.
- `src/components/shared/StatusBadge.tsx` — one component, color map: `active`/`completed`→green, `low_stock`→amber, `out_of_stock`/`cancelled`→red. Used on Product table, Order table, Low Stock table.
- `src/components/shared/DataTable.tsx` — thin wrapper around shadcn `Table` with built-in loading (skeleton rows), error (retry button), and empty state (`"No {items} yet"`) — every dashboard table below reuses this instead of hand-rolling those three states each time.
- `src/components/shared/PageHeader.tsx` — title + optional right-aligned action button slot (e.g. "New Category", "New Product").

### 2.1 Dashboard (`/dashboard`) — PRD §2.1

- No dedicated API module. Compose from: `useGetAllProductsQuery()` (total count + derive low-stock count client-side, or call `useGetRestockQueueQuery()` for the count), `useGetSalesAnalyticsQuery({period:'daily'})` and `{period:'monthly'}` for today's/month's revenue, `useGetRecentActivitiesQuery({limit:10})`.
- Layout: 4 `KPICard` components in a responsive grid (`grid-cols-1 sm:grid-cols-2 lg:grid-cols-4`) — Total Products, Low Stock Count, Today's Sales, This Month's Revenue. Below: a `RecentActivityList` reusing `TActivity[]`, each row shows `message` + relative timestamp (`date-fns`'s `formatDistanceToNow`).
- All roles see this page identically.

### 2.2 Category (`/dashboard/category`) — PRD §2.2

- `useGetAllCategoriesQuery()`, `useCreateCategoryMutation()`, `useUpdateCategoryMutation()`, `useDeleteCategoryMutation()` — all already in `categoryApi.ts`.
- Table columns: thumbnail, name, description, active/inactive toggle (a `Switch` that fires `updateCategory({id, data:{isActive}})` optimistically), actions (edit/delete).
- Create/edit via one shared `CategoryFormDialog` (shadcn `Dialog` + `react-hook-form`), fields: name, description, thumbnail (use `ImageUploader`), isActive.
- Wrap the "New Category" button and the edit/delete action column in `<RoleGate allow={['admin','superAdmin']}>` — staff sees the table fully, no action controls.

### 2.3 Inventory / Product (`/dashboard/inventory`) — PRD §2.3

- `useGetAllProductsQuery(params)` with `search`, `category`, `status` query params driving a search box + two `Select` filters; paginate via `params.page`/`params.limit` and `TMeta`.
- Table columns: thumbnail, name, category (resolve `TProduct.category` — populated object or id), price, stockQuantity, `StatusBadge` (status is server-derived, never editable directly — the edit form must not expose a status field).
- Create/edit via `ProductFormDialog`: name, description, category (`Select` populated from `useGetAllCategoriesQuery()`), thumbnail (`ImageUploader`), price, stockQuantity, minStockThreshold.
- `<RoleGate allow={['admin','superAdmin']}>` around New/Edit/Delete, same pattern as Category.

### 2.4 Order (`/dashboard/order`) — PRD §2.4

- Two sections on one page: an `OrderForm` (top) and an `OrdersTable` (below).
- `OrderForm`: searchable product dropdown (shadcn `Combobox` pattern — `Popover` + `Command` — filtering `useGetAllProductsQuery({search})` client-side as the staff types, and showing each option's current `stockQuantity`), quantity (`number` input, client-side validate `<= stockQuantity`), optional discount, optional customerName/customerContact/note. On submit calls `useCreateOrderMutation()`; because it `invalidatesTags: [orders, products, activity]`, the product list/stock and Dashboard KPI cards refresh without a manual reload — this is the "no page refresh" acceptance-checklist item, don't work around it with `window.location.reload()`.
- `OrdersTable`: `useGetAllOrdersQuery(params)` — search/status/date filters, paginated. Cancel action (`useCancelOrderMutation()`, prompts for an optional `cancelReason`) wrapped in `<RoleGate allow={['admin','superAdmin']}>` — staff can view every row but never sees a Cancel button.

### 2.5 Sales (`/dashboard/sales`) — PRD §2.5

- Period `Tabs` (Daily/Weekly/Monthly/Yearly) driving `useGetSalesAnalyticsQuery({period})` → feeds a `recharts` `<LineChart>` or `<BarChart>` (confirm actual field names returned before mapping `dataKey`s — see §2 step 5).
- `useGetTopProductsQuery({limit:5})` → a simple ranked list/table panel.
- `useGetSalesByCategoryQuery()` → a `<PieChart>` or horizontal bar breakdown.
- Summary numbers (total revenue, total orders, average order value) computed client-side by `reduce`-ing the analytics response — do not add a new endpoint for this (hard constraint, PRD §2.5).
- Per PRD §3 default: visible to staff too (read-only, no mutations on this page regardless of role).

### 2.6 Low Stock Quantity (`/dashboard/low-stock`) — PRD §2.6

- `useGetRestockQueueQuery()` — already server-sorted by urgency, don't re-sort client-side.
- Table: product name, current stock, threshold, `StatusBadge` — visually separate `out_of_stock` rows (red, e.g. row background tint) from `low_stock` (amber). All roles view-only per PRD §3 table.
- Optional "dismiss" action (`restockIgnored` flag) is v2 — skip unless the owner asks for it (PRD explicitly says not required for v1).

### 2.7 Inventory Activity (`/dashboard/activity`) — PRD §2.7

- `useGetRecentActivitiesQuery(params)` with a `type` filter (`order`/`product`/`user`/`system` — matches server's `TActivityType`) and pagination.
- Reverse-chronological list, each row: an icon per `type`, `message`, timestamp. All roles view-only.

### 2.8 User Management (`/dashboard/users`) — PRD §2.8

- Entire nav item + route hidden for staff — enforce in `drawerItems.ts` (already done) **and** redirect-guard the route itself in `layout.tsx` or the page, since a staff user could still type the URL directly.
- `useGetAllUsersQuery()` table: username, email, contactNumber, role badge, active/blocked toggle (`useDeactivateUserMutation()`).
- Create via `useCreateStaffMutation()` — a `role` select offering `staff`/`admin`, but disable the `admin` option unless the current user is `superAdmin` (server enforces this too, per `route.user.ts` comment — client disabling is UX only).
- Never render a password field for an existing user in the edit form (PRD explicit constraint).

### 2.9 Settings (`/dashboard/settings`) — PRD §2.9

- Two independent forms, both operate on the logged-in user only (no `:userId` param):
  - Profile form: `useGetMeQuery()` to prefill, `useUpdateProfileMutation()` on submit — fields username/email/contactNumber/profilePicture, matches `updateProfileSchema` in `utils/interface.ts`.
  - Change-password form: `useChangePasswordMutation()`, fields `oldPassword`/`newPassword`/a client-only confirm field (not sent to the server), matches `changePasswordSchema`.
- Identical for every role — no `RoleGate` needed here.

## 3. Hard constraints (don't violate)

- No cart/checkout/purchase affordance anywhere on the public homepage.
- Sidebar sections must be named exactly `General` / `Tracking` / `Management`.
- Client never sets a product's `status` directly — it's server-derived from stock quantity.
- Sales page hits only `/orders/analytics/*` endpoints — no new endpoint invented for it.
- Role-based hide/disable is UX polish only, not a security boundary — server enforces real permissions; every restricted action must still be tested against a live 403.
- No multi-warehouse UI, no SMS/email notification UI, no customer accounts, no payment-gateway/channel widgets.

## 4. Still needed before pages can be built

- shadcn/ui hasn't been initialized yet (`npx shadcn@latest init` + add table/form/dialog/badge/card/tabs/select components).
- `recharts` (or similar) not yet installed for the Sales page charts.
- `react-hook-form` + `@hookform/resolvers` not yet installed to wire the existing zod schemas in `utils/interface.ts` to forms.
- Default `app/page.tsx` and `app/layout.tsx` are still create-next-app boilerplate — replace when building the public homepage.
- No route guard / middleware for `/dashboard/*` yet.

## 5. Definition of done (per page)

Wired to the real endpoint (no mock data) → role behavior verified by actually logging in as staff/admin/superAdmin → responsive at 320px/768px/1024px/1440px → loading/error/empty states handled → no console errors.
