---
title: SOP - Aziz Brothers Smart Inventory Client
stack: Next.js (App Router) + TypeScript + Tailwind CSS + shadcn/ui + Redux Toolkit/RTK Query
companion: aziz-inventory-prd-client.md
---

# SOP: Aziz Brothers Smart Inventory Client

## Goal

One Next.js app, two surfaces: a public read-only homepage (no auth) and an internal dashboard (role-gated). Build the dashboard's data layer against the server contract in `aziz-inventory-prd-server.md`, don't invent endpoints the server doesn't have, especially for Sales (client-side only, per both PRDs).

## Step-by-step workflow

1. **Scaffold**: Next.js App Router, Tailwind, shadcn/ui install, RTK Query set up with one API slice per server module (`authApi`, `categoryApi`, `productApi`, `orderApi`, `activityApi`, `userApi`) mirroring the server's module boundaries exactly, this keeps the client's structure legible against the server's.

2. **Build the public homepage first** (§1 of the PRD), it has no auth dependency and is the simplest surface, good for validating the API connection end to end before the dashboard's complexity.

3. **Auth flow**: login form, JWT stored. **Note (confirmed against the running server code, 2026-09-16):** the server's `auth` middleware (`aziz-server/src/app/middlewares/auth.ts`) reads the token strictly from the `Authorization` header — it never reads the `accessToken`/`refreshToken` httpOnly cookies the login controller also sets, so those cookies are currently dead weight server-side. The only working option today is storing the access token client-side and attaching it as a Bearer header; the existing scaffold does this via `localStorage` + an axios request interceptor (`src/helpers/axios/axiosInstance.ts` + `src/utils/local-storage.ts`). This supersedes the original cookie-based recommendation, which the server doesn't actually implement. If httpOnly-cookie auth is wanted later, the server's `auth` middleware needs to also check `req.cookies.accessToken` — that's a server-side change, raise it with whoever owns the server before relying on it client-side. Route-guard the `/dashboard/*` tree, redirect unauthenticated users to login.

4. **Dashboard shell**: sidebar with the exact General/Tracking/Management grouping, role-aware nav (hide items per PRD §3's table), a shared layout so every dashboard page gets consistent header/breadcrumb.

5. **Build dashboard pages in this order**: Category and Inventory/Product first (they're straightforward CRUD tables and unblock everything downstream), then Order (the core new workflow), then Low Stock Quantity and Inventory Activity (both are read-only tables over existing endpoints, quick), then Sales (needs Order data to exist to be testable), then User Management and Settings last (lowest usage frequency, least urgent).

6. **Sales page discipline**: before writing this page, re-check the server's `/orders/analytics/*` response shape (it may still be in progress if server and client work is happening in parallel), don't build charts against assumed fields, confirm the actual JSON first.

7. **Role-gating is UI polish, not the security boundary.** Hide/disable per PRD §3, but don't skip testing what happens when a staff account calls a restricted action directly (should get a clean 403-driven error toast, not a broken UI state).

8. **Test at 320px, 768px, 1024px, 1440px**, staff will likely use the Order-entry form on a phone on the shop floor, prioritize that flow being comfortable on a small screen.

## Definition of done (per page)

Wired to the real endpoint (not mock data), role behavior matches PRD §3 table verified by actually logging in as each role, responsive, loading/error/empty states all handled (a product table with zero products should say so, not show a blank grid), no console errors.

## What's explicitly out of scope for this build

Multi-warehouse views, SMS/email notification UI, a customer-facing account/login (this system has no customer accounts at all, only staff/admin/superAdmin), payment-gateway or channel-performance widgets like the reference screenshot's Shopee/Tokopedia/TikTok panels, those don't apply to an offline-sale business and should not be built even as placeholders.
