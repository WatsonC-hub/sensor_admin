@AGENTS.md

# Sensor app (sensor_admin)

A React + TypeScript app that Watsonc uses to manage environmental monitoring stations. Users work with locations and timeseries, take control measurements, do inspections, run QA, and plan field trips. The UI language is Danish.

- Domain vocabulary: see `CONTEXT.md`. Use those terms, and add new ones there when a feature introduces them.
- Architecture decisions: `docs/adr/`.
- Feature descriptions: Linear issues in the project **Field - Generel** (team Watsonc).

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
| Tilknytning | one row in `itinerary_loc_id_history` (`start_event`, `end_event`); active ones via the view `itinerary_loc_id_relation` |
| Afsluttet tur | `completed`, `completed_at`; Afslutningsårsag is `completion_reason` (derived) |
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
- **Styling (MUI v9):** put style values in `sx`. On `Typography`, use the `color` prop only with a palette key (`primary`, `secondary`, `error`, `textSecondary`, …). MUI silently ignores anything else (`"white"`, `"text.secondary"`, `"secondary.main"`), and the type check won't catch it, so use `sx={{color: …}}` for those.
- **Toasts:** react-toastify. User-facing text is in Danish.

## Commands
- `vp install`: install dependencies
- `vp dev`: start the dev server
- `vp check`: format, lint and type check (run this before you call work done)
- `vp run typecheck`: type-aware lint
- `vp run build`: production build

There is no test suite yet. Verify UI changes by running the app.

## Ture (itinerary)

Turhistorik is WAT-975, and tidsregistrering på ture (not built) is WAT-976. Frontend: `src/features/itinerary/`. Backend: `python_api`, `app/sensor_admin/tasks/` (data model in ADR 0002).

- **One writer.** `itinerary_links.py` in python_api is the only code that opens or closes tilknytninger in `itinerary_loc_id_history`. Endpoints, pejling and tilsyn call it (`end_link`, `close_check`, `release_open_links`, `open_link`).
- **Old row shape kept.** `done` keeps its old meaning: true only when the last opgave in Feltarbejde at the lokation was finished. Removing or moving a lokation inserts a row without a tur after it. How a tilknytning ended lives in `end_event`/`ended_at`/`ended_by`. Open means the `OPEN` condition: the lokation's newest row, with a tur, `done = false` and no `end_event`. The view `itinerary_loc_id_relation` is unchanged and still means "which tur is the lokation on now".
- **Besøgt rule.** A tilknytning ends besøgt when an opgave changed to a `closed`-category status, or a pejling (`timeofmeas`) or tilsyn (`dato`) happened at the lokation inside its window; otherwise fjernet (or frigivet when the tur is ended by hand). Every tilsyn counts, also a visit where nothing could be fixed; every pejling counts, since we can't tell afterwards which notifikation it cleared. But only a tilsyn with batteriskift triggers `close_check` (it's the only tilsyn that clears an opgave), so a plain tilsyn never ends a tilknytning by itself. The same rule is in `resolve_end_event`, the Forløb (`buildForloeb`) and the migration scripts; change all of them together.
- **Worked out, not stored:** Afslutningsårsag (`completion_reason`), flyttet (`moved_to(...)`: a fjernet row followed within 5 seconds by a row on another tur), and the projekt of each Forløb event (udstyr mounted at the time, else `initial_project_no`).
- **Old rows keep arriving.** Until the backend is deployed, the live API writes rows without `end_event`. After deploying, rerun `migrations/2026-11-itinerary-history.sql` (rerunnable), then the fix-up scripts next to it. The shared database is changed only by the user running those scripts; query it read-only.
- **Cache.** Anything that can close a tilknytning (opgave patch, pejling, tilsyn) invalidates `Itineraries.all()`, which by prefix also refreshes history, links and Forløb.

## Workflow for new features
1. Sharpen the idea (`/grilling`), and optionally prototype it (`/prototype`).
2. Describe the feature in a Linear issue in **Field - Generel**: Danish, non-technical, written for the field users (goal, how it works, rules, what's left out). Add any new terms to `CONTEXT.md`.
3. Plan in plan mode, then build on a feature branch off `development`.
4. Run `vp check`, then verify in the running app.
5. Review with `/code-review`, and `/simplify` if needed.
6. Capture what you learned:
   - Update the Linear issue if what shipped differs from it.
   - Add an ADR only if the decision is hard to reverse, would surprise a reader, and involved a real trade-off.
   - Update this file if a new convention appeared.
