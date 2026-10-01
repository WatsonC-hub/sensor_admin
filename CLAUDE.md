@AGENTS.md

# Sensor app (sensor_admin)

A React + TypeScript app that Watsonc uses to manage environmental monitoring stations. Users work with locations and timeseries, take control measurements, do inspections, run QA, and plan field trips. The UI language is Danish.

- Domain vocabulary: see `CONTEXT.md`. Use those terms, and add new ones there when a feature introduces them.
- Architecture decisions: `docs/adr/`.
- Feature specs: `docs/features/` (see the template in its README).

## App shape: one page, map with windows

The whole app is a single page: a map background with windows on top, and each feature lives in a window (see ADR 0001).
- `src/features/tasks/components/Overview.tsx` decides which windows to show, using `src/components/ui/WindowManager.tsx` (`WindowManager.Window` with `show` and `priority`).
- **Navigation changes state, not the URL.** Use `src/hooks/useNavigationFunctions.ts` (`location`, `station`, `boreholeIntake`, `home`, `createStamdata`). It writes to the zustand display store in `src/hooks/ui.ts` (`loc_id`, `ts_id`, `boreholeno`, `intakeno`, `itinerary_id`, …).
- `src/Router.tsx` has only a few routes: `/` (Home), `/stamdata` (create station), `/:labelid` (QR scan), and a catch-all that redirects to `/`. Don't add routes for features; add a window instead.

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
