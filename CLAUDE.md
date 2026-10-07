@AGENTS.md

# Sensor app (sensor_admin)

A React + TypeScript app that Watsonc uses to manage environmental monitoring stations. Users work with locations and timeseries, take control measurements, do inspections, run QA, and plan field trips. The UI language is Danish.

- Domain vocabulary: see `CONTEXT.md`. Use those terms, and add new ones there when a feature introduces them.
- Architecture decisions: `docs/adr/`.
- Feature specs: `docs/features/` (see the template in its README).

## Domain terms in code

`CONTEXT.md` is the glossary. The code often uses older or English names for the same concepts. New code should use the `CONTEXT.md` term or its direct English equivalent. Never introduce the word "station": it can mean a tidsserie, a lokation or an opsætning. Keep legacy names until you touch that code substantially.

| Term | Code names today |
|---|---|
| Tidsserie | `ts_id`, `timeseries`, `station` |
| Lokation | `loc_id`, `location` |
| Terminal | `terminal_id`, `terminal_type` |
| Sensor | `terminal_id` + `sensor_id` |
| Udstyr | `unit`, `unit_uuid` (one per `signal_id`) |
| Sensortype | `sensortypeid`, `sensortypename` (must equal `tstype_id`) |
| Hjemtagning | `end_unit_history_batch`, `change_reason` (årsag) |
| Handling | `action`: `DO_NOTHING`, `CLOSE_UNIT`, `CLOSE_SENSOR`, `CLOSE_ALL_UNITS`, `CLOSE_UNIT_INVOICE`, `CLOSE_INVOICE_ADD_INVENTORY` |
| Overført fakturering | `inherit_invoice` |
| Terminal-ID | `terminal_id` |
| Tidsseriestatus / Lokationsstatus | backend flags `not_serviced`, `inactive_new`, `in_service` (combined in `src/features/notifications/Utils.tsx`) |
| Anlæg | `plantid`, `plantname` |
| Pejlestatus | `BoreHoleFlagEnum` |
| Projektejer | `org_id_owner`; drives `can_edit` on opgaver |
| Ansvarlig | `assigned_to` |
| Uplanlagt | opgave with `itinerary_id === null` |
| Calypso ID | `calypso_id`, `labelid` |
| Pejling | `kontrol`, `pejling`, `measurement` |
| Korrektionsomfang | `useforcorrection` (`correction_map` in `src/consts.ts`; 0 = kontrolpejling) |
| Korrektionstype | `correction_type` (`translation` = parallelforskydning, `scale` = lineær korrektion) |
| Driftpejling | `service` on a pejling |
| Tilsyn | `service`, `tilsyn` |
| Målepunkt | `watlevmp`, `maalepunkt`, `MP` |
| Opgave | `task`; `is_created` is true for an oprettet opgave, false for a notifikationsopgave |
| Feltarbejde (opgavestatus) | `status_id = 2` (`StatusEnum.FIELD`) |
| Tur | `itinerary`, `trip` |
| Nøgle / adgang | `location_access` |
| Parkering | `parking` |
| Serviceansvar | `is_customer_service` |
| Egen service | `has_own_service` |
| Kontrolhyppighed | `controls_per_year`, `yearly_controls`, `ServiceInterval` |
| Forvarsling | `lead_time` |
| Løsningsfrist / SLA | `sla`, `days_to_visitation` |
| Tjekliste | `stationProgress`, `stamdata/progress` |
| Synlighed | `requires_auth` (kræver login), `hide_public` (skjult offentligt) |
| Algoritme | `algorithms` ("Advarsler" in the UI) |
| Justering kinds | `confirm`, `remove`, `bounds`, `correction` |
| Tidsserietype | `tstype` |
| Lokationstype | `loctype` (9 = Boring) |
| Projekt | `projectno`, `initial_project_no` |
| Funktionsadgang | `user.features.*` |

## App shape: one page, map with windows

The whole app is a single page: a map background with windows on top, and each feature lives in a window (see ADR 0001).
- `src/features/tasks/components/Overview.tsx` decides which windows to show, using `src/components/ui/WindowManager.tsx` (`WindowManager.Window` with `show` and `priority`).
- **Navigation changes state, not the URL.** Use `src/hooks/useNavigationFunctions.ts` (`location`, `station`, `boreholeIntake`, `home`, `createStamdata`). It writes to the zustand display store in `src/hooks/ui.ts` (`loc_id`, `ts_id`, `boreholeno`, `intakeno`, `itinerary_id`, …).
- The window for a lokation or tidsserie is the **lokationsvindue**. Its left-side page menu is the **lokationsmenu** (code: `StationDrawer`, `src/features/station/`). These are UI names, not domain terms.
- `src/Router.tsx` has only a few routes: `/` (Home), `/stamdata` (opsætning), `/:labelid` (QR scan), and a catch-all that redirects to `/`. Don't add routes for features; add a window instead.

**Legacy structure:** `src/pages/admin/*` and `src/pages/field/*` are left over from when the app had separate Field and Admin pages. Much of that code is still imported, but the split means nothing now. Don't copy the structure and don't add to it. Put new code in `src/features/<feature>/`, and move legacy code there when you touch it substantially.

## Conventions
- **Imports:** use the `~/` alias for `src/`.
- **Feature folder:** `src/features/<feature>/` holds `api/` (query and mutation hooks), `components/`, and optionally `types.ts`, `schema.ts` and `helpers.ts`. Look at `src/features/tilsyn/api/useTilsyn.ts` before writing a new API hook.
- **Server state:** TanStack Query on top of `src/apiClient.ts` (axios, baseURL `/api`).
  - Define `queryOptions(...)` at module level, then expose it through a `useX()` hook.
  - Query keys come from `src/helpers/QueryKeyFactoryHelper.ts`. Don't write inline key arrays in new code.
  - For invalidation, mutations set `meta: {invalidates: [queryKey]}`, which the global handler in `src/queryClient.ts` acts on (it matches by prefix). Use `optOutGeneralInvalidations` to skip the general invalidation.
- **UI state:**
  - Selection and navigation: the zustand store in `src/hooks/ui.ts`.
  - Other client state: jotai atoms in `src/state/atoms.ts`.
  - URL params: nuqs, in `src/hooks/useQueryStateParameters.ts`.
  - Required ids from context: `useAppContext([...])` in `src/state/contexts.ts`.
- **Forms:** react-hook-form + zod. Prefer the typed form helper in `src/components/formComponents/Form.tsx` (`createTypedForm<T>()`) over the older `FormInput`/`FormTextField`.
- **Tables:** material-react-table through `src/hooks/useTable.ts`. Persist table state with `src/hooks/useStatefulTableAtom.ts`. Desktop and mobile usually have separate `*TableDesktop.tsx`/`*TableMobile.tsx` files.
- **Responsive layout:** use `useBreakpoints()` (`isMobile`) for layout differences.
- **Toasts:** react-toastify. User-facing text is in Danish.

## Commands
- `vp install`: install dependencies
- `vp dev`: start the dev server
- `vp check`: format, lint and type check (run this before you call work done)
- `vp run typecheck`: type-aware lint
- `vp run build`: production build

There is no test suite yet. Verify UI changes by running the app.

## Workflow for new features
1. Sharpen the idea (`/grilling`), and optionally prototype it (`/prototype`).
2. Write `docs/features/<name>.md` from the template. Add any new terms to `CONTEXT.md`.
3. Plan in plan mode, then build on a feature branch off `development`.
4. Run `vp check`, then verify in the running app.
5. Review with `/code-review`, and `/simplify` if needed.
6. Capture what you learned:
   - Update the spec's "Notes after shipping".
   - Add an ADR only if the decision is hard to reverse, would surprise a reader, and involved a real trade-off.
   - Update this file if a new convention appeared.
