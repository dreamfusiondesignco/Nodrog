# Handoff: Nodrog Logistics — Fleet Maintenance App

## Overview
A mobile-first maintenance app for the **Nodrog Logistics** truck fleets (**IGL** and **Massy**, plus any fleets an admin adds). Crews log in on their phones to run weekly inspection checks, log faults (with photo/video), take trucks out of service, track parts inventory and which parts were fitted to which truck, review past weekly reports, and (admins) manage fleets and raise repair invoices.

The goal of this handoff is to take the working **HTML prototype** in `prototype/` and rebuild it as a **real, deployable app** with a shared database, real per-person logins, and offline-friendly mobile use.

## About the Design Files
The files in `prototype/` are **design references created in HTML/React (via in-browser Babel)** — they show the intended look, layout, copy, and behavior. **They are not the production codebase.** Open `prototype/Nodrog Maintenance (offline).html` in any browser to interact with the full prototype (it runs standalone, no server).

Your task is to **recreate these designs in a production stack** using its established patterns. Recommended stack (see "Recommended build" below): **React + Vite + Supabase**, deployed as a PWA. If you already have a preferred stack, use it — the design intent and data model below are framework-agnostic.

## Fidelity
**High-fidelity.** Colors, typography, spacing, components, and interactions are final. Recreate the UI faithfully using your stack's component library, then wire it to the database described here. The prototype currently stores everything in `localStorage` as a stand-in for the real backend — replace that layer with Supabase.

---

## Recommended build (fastest real path)
1. **Frontend:** React + Vite (TypeScript recommended). Port the prototype screens 1:1.
2. **Backend:** **Supabase** — Postgres database, Auth (email/password), and Storage (photos/videos).
   - Run `supabase/schema.sql` then `supabase/rls_policies.sql` in the Supabase SQL editor.
   - Create a private Storage bucket named `media`.
3. **Auth:** Supabase Auth with email + password. Each crew member is invited by email and sets their own password. See `docs/Login Flow.html` for the exact sign-in journey to build.
4. **Hosting:** Deploy the frontend free to **Vercel** or **Netlify** (auto HTTPS). It's a **PWA** — users tap *Add to Home Screen* to "install" it; no app store.
5. **Offline (recommended):** Add a service worker + optimistic local cache so a mechanic in a low-signal garage can complete a check and have it sync on reconnect.

A full plain-English version of this plan (with costs) is in `docs/Build & Host Guide.html`.

---

## Screens / Views
All screens render inside a phone frame (max content width ~402px). Bottom tab bar: **Home · Trucks · Issues · Stock · More**.

### 1. Login
- **Purpose:** Authenticate. Email + password (prototype uses a demo PIN).
- **Layout:** Navy gradient background; white knockout logo + "Fleet Maintenance" heading; white card with Email + Password fields and a primary "Sign in" button; "Forgot password?" link; demo-account list (remove in production).
- **Production:** Wire to Supabase Auth `signInWithPassword`. On success load the user's `profile` (role + fleets) and route to the dashboard.

### 2. Dashboard (Home)
- **Purpose:** At-a-glance status for the active fleet scope.
- **Components:** Greeting; an **out-of-service alert banner** (red) if any truck is OOS; four stat cards (Checks due, Open issues w/ serious count badge, Low-stock parts, Active trucks); **Needs attention** list (trucks not "ok"); **Upcoming & due** reminders (cert expiries within 30 days + service approaching by miles).

### 3. Trucks (list)
- **Purpose:** Browse/filter vehicles.
- **Controls:** Two **dropdowns** — Fleet ("All fleets" + each fleet) and Status ("All trucks / Needs attention / Up to date").
- **Rows:** Glide-inspired card — vehicle thumbnail tile, plate + soft status pill, model + fleet chip, a driver + odometer line, a chevron, and a color-coded **"Next service"** strip (green / amber / red → miles to next service or "Overdue"). Odometer must not wrap.

### 4. Truck detail
- **Header:** Plate + status badge.
- **Identity card:** A **photo slot** at the top (drag/drop or tap to upload a truck photo; persists per truck → `trucks.photo_url`), then a 2-col grid: Odometer, Idle hours, Driver, Location, Segment, Capacity.
- **Primary actions:** "Weekly check" (→ inspection form) and "Take out of service" / "Return to duty" toggle.
- **Tabs:**
  - **Service** — engine meters (miles + idle hours vs next-due), last-service rows (air filter, transmission, front/rear diff), **Parts fitted** list with an "Add / Record part used" button (deducts from inventory).
  - **Issues** — issues for this truck + "Log an issue".
  - **History** — timeline of service history, with an **"Add service record"** button → form (service type with quick presets, date, odometer, notes) that prepends a `service_history` row.
  - **Docs** — chassis no. + expiry rows (insurance, fitness, MV reg, carrier licence, fire extinguisher), each color-coded if expiring/expired, plus an **"Edit documents"** button (editable form).

### 5. Weekly check (inspection)
- **Purpose:** Complete the Nodrog inspection sheet.
- **Layout:** Sticky progress bar (X/40 checked, count needing attention). Sections: Steering & drivetrain, Fluids, then per-position groups (Front/Mid-Rear/Rear-Rear × Left/Right) each with Suspension, Lights, Brakes, Wheels/Tires, Wheel hub oil. Each line has three controls: **note** (pencil → inline textarea), **OK** (check), **needs-attention** (alert). Then Missing items, Photos & video (upload slots incl. video), General comments, and "Complete check".
- **On save:** Create an `inspections` row (results + per-line notes + attn count); update the truck's `status` and `last_check`.

### 6. Issues (list + log)
- **List:** Filter chips (Open / Serious / Resolved / All). Each card: title (must wrap above the meta line — do not overlap), truck · author · date, severity badge, OOS badge, "Needed to fix" callout for serious issues.
- **Log issue form:** Truck select, title, details, severity selector, **Photos & video** upload (includes a video slot), "Serious issue" toggle → reveals "Take out of service" toggle + "What's needed to fix it". Saving a serious+OOS issue sets the truck status to `oos`.

### 7. Inventory (Stock)
- **List:** Search, fleet dropdown; each part shows name, SKU · location · fleet chip, qty (red if ≤ min) with +/- steppers. "+" header button → **New part** form (Part name, SKU, Quantity, Min level — *no* location/belongs-to fields in current design; parts default to SHARED).

### 8. More (hub)
- **Records:** Weekly reports (review past inspections → report detail), Reports & export.
- **Admin (admins only):** Invoices (list → detail with status draft/sent/paid; "+" → New invoice with line items, live total), Manage fleets (list + add fleet), Add a part.
- **Account:** User card (name, role, fleets), and a **"Viewing fleet" dropdown** — the global fleet filter (All fleets + each fleet). This filter scopes every screen.

### 9. Weekly reports review + Report detail
- List of saved inspections (filter: All / With flags / All clear). Detail shows identity, general notes, missing items, "Needs attention" lines (with notes), and "Checked OK" lines.

### 10. Invoices (admin) + New invoice + detail
- List with outstanding total + status filters. New invoice: fleet, optional truck, vendor/customer, type, due date, repeatable line items (desc × qty × unit, live subtotal + total), notes. Detail: line items, total, status toggle (draft → sent → paid).

### 11. Manage fleets (admin)
- List of fleets (truck/part counts) + "Add a fleet" (short name + full name). New fleets appear everywhere instantly (switcher, filters, assignment dropdowns).

---

## Interactions & Behavior
- **Navigation:** Bottom tab bar + push/back within sections. The active fleet filter (`fleet`, default `ALL`) scopes all data queries.
- **Role/fleet access:** Admins & lead mechanics see all fleets; fleet mechanics see one. Enforced in the DB by RLS (see `supabase/rls_policies.sql`) — never trust the client alone.
- **Toasts:** Brief confirmation pill after save actions.
- **Out-of-service:** Toggling OOS (or saving a serious+OOS issue) sets `trucks.status = 'oos'` and surfaces the truck on the dashboard banner.
- **Stock deduction:** Recording a part used decrements `parts.qty` and writes a `part_usage` row.
- **Photo/video upload:** Upload to Supabase Storage `media` bucket; store the returned path on the row. Cap video size; allow deferred upload when offline.
- **Reduced motion / print:** No essential content should be hidden behind animations.

## State Management
Per-user session (Supabase Auth) + these data collections, all fleet-scoped: `fleets, trucks, parts, part_usage, issues, inspections, invoices`. Local UI state: active tab, active fleet filter, route/param, form state. Prefer a data layer (e.g. React Query/SWR + Supabase client) over ad-hoc fetches.

## Design Tokens (default "Nodrog Navy" theme)
Defined in `prototype/nm-data.jsx` (THEMES). Two alternate themes exist (Field Dark, Hi-Vis) — optional.
- **Colors:** bg `#EEF2F7`, surface `#FFFFFF`, surface2 `#F4F7FB`, text `#0B1A2B`, muted `#5C6B7E`, border `#DCE4ED`, primary `#0E2236`, accent (blue) `#1E63D6`, accent2 (orange) `#F4842B`, danger `#D63A3A`, warn `#D98214`, ok `#1B9255`, critical `#B11E1E`.
- **Status colors:** ok→`#1B9255`, due→`#D98214`, overdue→`#D63A3A`, oos→`#B11E1E`.
- **Typography:** Plus Jakarta Sans (400–800). Headings 800; body 13–16px; never below 11px for meta. `text-wrap: pretty` on multi-line titles.
- **Radius:** cards 14–16px, inputs/buttons 11–13px, pills 999px. **Min tap target 44px.**
- **Inputs:** 48px tall; focus ring `0 0 0 3px rgba(30,99,214,.16)` + blue border.
- **Shadows:** subtle; login card `0 18px 50px rgba(0,0,0,.35)`.

## Assets
- **Logo:** `prototype/assets/nodrog-mark.svg` (navy, for light backgrounds) and `nodrog-mark-light.svg` (white knockout, for dark backgrounds). Original supplied by client.
- **Icons:** Inline single-path stroke SVG set defined in `prototype/nm-ui.jsx` (the `PATHS` map). Swap for your icon library (Lucide is a close match) if preferred.
- **Fonts:** Plus Jakarta Sans via Google Fonts.

## Files (in this bundle)
- `prototype/Nodrog Maintenance (offline).html` — **open this to see the full working prototype** (standalone).
- `prototype/Nodrog Maintenance.html` — the source entry (loads the .jsx files below).
- `prototype/nm-data.jsx` — themes + seed data + the **data model** (start here).
- `prototype/nm-ui.jsx` — shared components, icons, theme engine, phone frame.
- `prototype/nm-screens-core.jsx` — Login, Dashboard, Trucks, Truck detail.
- `prototype/nm-screens-forms.jsx` — Issue log, Inventory, Weekly check, Reports.
- `prototype/nm-screens-admin.jsx` — More hub, New part, Manage fleets, Weekly reports, Invoices, Record-part-used, Edit-docs, Add-service-record.
- `prototype/nm-app.jsx` — routing, role/fleet scoping, persistence, nav.
- `prototype/tweaks-panel.jsx`, `prototype/image-slot.js` — supporting components.
- `supabase/schema.sql` — database tables (run first).
- `supabase/rls_policies.sql` — security policies + storage notes (run second).
- `docs/Build & Host Guide.html` — plain-English build/host/cost plan.
- `docs/Login Flow.html` — the sign-in journey to implement.

## Build checklist
1. Create a Supabase project (region: US East). Run `schema.sql`, then `rls_policies.sql`. Create the `media` Storage bucket + policies.
2. Scaffold React + Vite; install `@supabase/supabase-js`. Add the project URL + anon key as env vars.
3. Port screens from `prototype/` 1:1 (high-fidelity). Replace the `localStorage` data layer with Supabase queries; apply the fleet filter in queries (RLS is the backstop).
4. Build the auth flow per `docs/Login Flow.html`. Invite real users; insert matching `profiles` rows with role + fleet access.
5. Wire photo/video uploads to Storage.
6. Add PWA manifest + service worker (offline). Deploy to Vercel/Netlify.
7. Import the client's real trucks, parts, and checklist; pilot for one week; then move Supabase to the Pro plan for daily backups + 24/7 uptime.

> Note: the logo is the client's brand asset — keep it; everything else can adopt your codebase's conventions where it doesn't conflict with the high-fidelity intent above.
