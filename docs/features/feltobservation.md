# Feltobservation (PoC)

Status: PoC built (2026-11-11), not merged
Branch/PR: –

## Goal
Consultants and underleverandører document what they find on site (drænbrønde, boringer, jordprøver, vandløb): a geometry, notes and photos, optionally in a projekt. This PoC proves two things in Field: a data model that works wherever the feature ends up (Field, Explorer or a standalone app), and offline capture that stays usable on a connection that is slow, not just absent.

The PoC does not settle where the feature lives. It keeps the decision cheap: the data lives in its own `register` schema, the UI lives on its own route, and nothing else in Field changes.

## Decisions this PoC rests on
- **Field writes, others read.** Feltobservationer are created and edited only through `python_api`. Explorer, GC2 and QGIS read them. See ADR 0002.
- **Own route, not a window.** The feature lives on `/observation` in `src/features/fieldObservation/`, with its own Leaflet map. This is a deliberate exception to ADR 0001, so the feature is easy to move or remove until the placement decision is made. It reuses Field's top bar (`NavBar`) and base-layer factories, but not `Overview`/`WindowManager`.
- **No feature flag.** No new Funktionsadgang flag in the DB until the placement decision is made. Every logged-in user can reach the route, also without IoT- or pejleboringsadgang.
- **Local-first.** On the device, IndexedDB (Dexie) is the source of truth. The UI never waits for the network. Overførsel is a separate process that is allowed to be slow.
- The model comes from Explorer's plan (`calypso-explorer`, branch `feature/register`, `docs/planning/field-documentation-plan.md`), moved to the `register` schema. Explorer's "Case" is Field's **projekt**.

## User flows
1. The user opens Feltobservationer: from **Skift til Feltobservationer** in Field's menu, from the PWA shortcut, or directly on `/observation`. The app remembers the last mode and reopens in it. The top bar is Field's own. The map shows the user's position and the feltobservationer from the user's projekter, read from the device. A projekt field at the top filters the map.
   - **Skift til Servicering** in the same menu goes back to the rest of Field.
2. The user taps **Ny feltobservation** (bottom right; icon only on mobile). A crosshair appears in the middle of the map, and the map centres on the GPS position. The user pans the map under the crosshair and confirms. The GPS accuracy is stored if the point is left at the GPS position.
3. The user picks an observationstype, optionally a projekt (the one chosen in the projekt field is suggested; "Intet projekt" is allowed), and writes a note and an optional intern note, then presses **Gem**. Photos can be added once the feltobservation is saved: each photo, and its comment, is saved the moment it is picked or edited, without **Gem**. Everything goes to the device only.
4. The user opens an existing feltobservation and edits the note, intern note, type or projekt, adds or deletes photos, or deletes the feltobservation. The geometry cannot be moved in the PoC.
5. An overførsel icon in the top bar shows the state, with a badge counting what is not overført. It opens a popover with the counts, the last success, warnings, the **Automatisk overførsel** switch and **Overfør nu**. In Auto mode, overførsel runs shortly after a change and on an interval. **Overfør nu** forces one attempt, and also retries rows the server rejected earlier.
6. On a bad connection, Auto pauses by itself; the icon turns orange and the popover says the connection is poor. Auto resumes by itself when the connection is good again, or the user presses **Overfør nu**. The user can also turn Auto off permanently.
7. A layers icon in the top bar opens two tabs: **Baggrund** (Kort and Satellit from Field, OpenStreetMap, and Dataforsyningen's ortofoto with a choice of year) and **GIS-lag** (Explorer's GIS layer catalog, grouped as in Explorer, turned on and off with checkboxes). The choices are remembered on the device.
8. A colleague's device pulls the new feltobservation on its next overførsel and shows it.

## Rules and edge cases
**Access**
- A feltobservation with a projekt: readable if `project_no` is in the user's view list (`get_view_permissions`), and writable if it is in the edit list (`get_edit_permissions`). Everyone with edit rights in the projekt can edit any of its feltobservationer.
- A feltobservation without a projekt: visible to and editable by only its `created_by`. It is never published.
- Moving a feltobservation to another projekt requires edit rights on both the old and the new projekt.
- New SQL uses bound parameters.

**Ids and time**
- The client generates UUIDv4 ids for feltobservationer and photos. All writes are idempotent upserts on `id`.
- `created_at` and `updated_at` come from the device (capture time and edit time). `created_by`/`updated_by` come from the logged-in user on the server, never from the client. The server stores `received_at`.
- Pull uses a server-assigned `version` (one shared sequence for both tables, bumped by a trigger on every write), never device clocks.

**Conflicts**
- Last-write-wins per row on the device's `updated_at`. If the incoming row is older than the stored row, the server ignores it and returns its own row, and the device overwrites its copy.
- The history trigger keeps every version, so the losing write can be recovered by hand.
- Deletes are soft (`deleted_at`) and travel as tombstones.

**Overførsel**
- Each local row has a `local_rev` counter. After a successful push, `dirty` is cleared only if `local_rev` has not changed, so an edit made during a push is not lost.
- Push runs in two passes:
  1. All dirty feltobservation and photo metadata in one batch request.
  2. Photo bytes, one request per photo, oldest first. A failed photo never blocks metadata.
  A photo's row is only created on the server once its feltobservation exists there.
- Every request has a hard timeout: about 15 s for metadata, and for photos scaled to the size. After 2 failures or timeouts in a row, Auto pauses.
- While paused, `GET /field_observation/ping` runs every 60 s. Auto resumes after two pings in a row under about 2 s. The exact values are tuned at build time.
- `navigator.onLine` and the Network Information API are not used as signals: they are unreliable, and the API does not exist on iOS.
- Overførsel runs only while the app is open. iOS has no Background Sync.

**Photos**
- Resized on the device to about 2048 px on the long edge, JPEG quality ~0.8.
- Stored in Dexie as an `ArrayBuffer` plus a mime type, not as a Blob (WebKit bug 235687: re-saving a Blob read back from IndexedDB fails). A Blob is made only to upload or show the photo.
- Photos taken on the device keep their bytes locally. Other photos are shown as thumbnails through the image proxy, only when online.

**Data safety**
- Call `navigator.storage.persist()` on first use. Show a warning when `persisted()` is false.
- Warn before logout or clearing data while "N ikke overført" is above 0.
- On iOS, the PoC must be installed on the Home Screen. In a Safari tab, IndexedDB can be cleared after 7 days without use.

## Data / API
**Schema `register`** (backend: `python_api`; a SQL script reviewed and applied by hand, no Alembic)

- `observation_type`: `id`, `schema_key` (unique, stable code key), `name`, `icon`, `color`, `geometry_types` (text[]; null = any). Seeded with `generel` and `draenbroend`.
- `field_observation`:
  - `id` uuid PK (client)
  - `project_no` varchar(30) **null**, FK → `sensor.sensor_projects(project_no)`
  - `type_id` FK → `observation_type`, not null
  - `geom geometry` not null. CHECK SRID = 25832. CHECK type ∈ Point, LineString, Polygon; Z allowed.
  - `position_accuracy_m` real
  - `note` text, `internal_note` text (never in published views)
  - `properties` jsonb default `{}`, `custom_fields` jsonb default `[]` (both empty in the PoC)
  - `created_at`, `updated_at` timestamptz (device); `created_by`, `updated_by` bigint (server)
  - `deleted_at` timestamptz
  - `received_at` timestamptz default now(); `version` bigint (server)
- `field_observation_image`:
  - `id` uuid PK (client)
  - `observation_id` FK
  - `s3_key`, `mime_type`, `note`, `taken_at`
  - the same audit, `deleted_at`, `received_at` and `version` columns
  - no `sync_status`: sync state lives on the device.
- `field_observation_history`: one row per insert, update or delete on the two tables above (table name, row id, operation, row as jsonb, time). Filled by a trigger. No UI.
- Photo bytes go to S3 bucket `watsonc-images` under `field_observation_images/{observation_id}/{image_id}.jpg`. Thumbnails come from the existing image proxy.
- Later, not in the PoC: one published view per geometry type (`field_observation_point`, `_line`, `_polygon`) without `internal_note` and without rows that have no projekt. GC2, Explorer and QGIS read these views.

**Endpoints** (new router `/field_observation` in `python_api`)
- `GET /field_observation/types`: the observationstype catalog.
- `GET /field_observation/projects`: `project_no` + `project_title` for the user's edit list.
- `GET /field_observation/changes?since=<version>`: feltobservationer and photo metadata visible to the user with `version > since`, tombstones included, paged. Returns the new cursor.
- `POST /field_observation/sync`: a batch of feltobservation and photo-metadata upserts. Returns, per row, `applied` or `stale` together with the server row, or `forbidden`, `invalid` or `pending_upload` (photo metadata whose bytes are not uploaded yet).
- `PUT /field_observation/{id}/image/{image_id}`: multipart photo bytes + metadata. Creates the row if it is missing. Idempotent.
- `GET /field_observation/ping`: a tiny health check used to measure round-trip time.
- The API takes and returns GeoJSON in EPSG:4326 and converts to and from 25832 in SQL.

**Device** (Dexie database, separate from the TanStack Query cache)
- Tables: `observations`, `images` (with bytes), `projects`, `types`, `meta` (cursor, overførsel mode).
- The UI reads feltobservationer through `useLiveQuery`; they never go through TanStack Query. Only the reference data for the map does: Explorer's GIS layer catalog and the ortofoto years.

**Map layers**
- Explorer's GIS layer catalog: `GET /explorer/api/gis-layers/gis`. The layers are drawn as WMS through Explorer's GC2 proxy (`/explorer/gc2/wms/watsonc/<schema>`, `LAYERS=<schema.table>`) with `SingleTileWms` (`src/features/map/singleTileWms.ts`, ported from web_projects): one image per viewport instead of tiles, which suits GC2/MapServer.
- `/explorer` is a same-origin proxy to `https://explorer.watsonc.dk`, so no CORS is needed. **It only exists in the vite dev server; production needs the same rule in front of Field.**
- The ortofoto is tiled WMS straight from Dataforsyningen (`orto_foraar_DAF`, layer `geodanmark_<year>_12_5cm`), as Explorer does it. The URL and token are copied from Explorer, which has no endpoint for its background maps yet. Explorer's vector background map is left out.
- The rest of Field's offline behaviour is unchanged.

## Demo / acceptance
1. A phone (installed PWA) and a laptop, both logged in on the same projekt.
2. On the laptop, DevTools throttling at about 20 kbps with 3 s latency. Creating a feltobservation with two photos stays instant. Auto pauses and the banner appears. **Overfør** pushes it through once the throttling is relaxed.
3. The phone pulls and shows the feltobservation.
4. Edit the same feltobservation on both devices. The later edit wins, and both versions are in the history table.
5. Open `register.field_observation` in QGIS as an ordinary PostGIS layer, read-only. The data does not depend on the app.

## Out of scope
- Offline map tiles
- Drawing lines and polygons, and moving geometry
- Published views, GC2 and the Explorer layer
- Customer access per row
- Editing from QGIS
- Type-specific forms (Explorer's Zod registry on `schema_key`)
- History UI
- A Funktionsadgang flag
- Boreprofiler and lab results: they get their own long tables later, as in Explorer's plan
- Registreringsstatus and dynamic styling
- Reports, uploaded projektlag, tracking where the user walks, dGPS integration, bulk import (see Fase 2)
- Polished Danish UI copy

## Fase 2: forberedelse og import (decided, not built)

### Why
Feltobservationer are often prepared before anyone goes out. For example, a consultant marks out similar-looking areas and a sample point in each one at the desk, and in the field the team fills those in: a photo, a note, the soil type. Things found that nobody planned (a well) are created on the spot, as in the PoC. The preparation is done in QGIS today, and may still be. Simple drawing tools in Field can take some of that work over.

### Decisions
- **Preparation happens in Field too.** Field is used on desktop by many people as well as in the field. Preparation is mostly a desktop experience, but desktop and mobile are equally important. ADR 0002 still holds: every write goes through `python_api`, with history and LWW.
- **No "planned → done" flow and no status column (yet).** A prepared feature is just a feltobservation of a given observationstype. The type decides which fields it has, and the fieldwork fills them in.
- **No links between feltobservationer.** No `parent_id`. A sample point and its area are two independent feltobservationer.
- **One create function, two input methods.**
  - Desktop: Geoman, clicking to draw points, lines and polygons, and its edit mode to move points and corners.
  - Mobile: the crosshair tool (Tilføj punkt / Fortryd / Færdig) for all geometry types, and Geoman's edit mode for moving.
  - Both end in `createObservation` / `updateObservation` with a GeoJSON geometry.
- **Typefelter are data, not code.**
  - Each observationstype has a field list in `observation_type.fields` (jsonb), e.g. `[{key, label, kind, options?, archived?}]`.
  - Kinds: text, number, select, boolean, date.
  - Field builds the form and the zod validation from the definition at runtime. The server validates `properties` against the same definition.
  - A type that needs something special (e.g. boreprofiler with layers) can later get its own component through `schema_key`.
- **Types are global** to start with. A `project_no` on `observation_type` can come later if the list gets cluttered.
- **Types are maintained directly in the database** for now. There is no editor, because types rarely change once defined.
- **Typefelter are append-only.**
  - A field's `key` and kind never change, and a key is never reused. The `label` can be renamed.
  - Removing a field means setting `archived`: it disappears from the form for new data, and existing values are shown read-only.
  - No data migration. A device with an old definition only uses keys that still exist, so its writes stay valid.
  - The server accepts archived keys and rejects unknown ones.

### Import
- **Formats:** GeoJSON, zipped Shapefile, KML and GeoPackage (QGIS's default). Explorer's parser covers the first three, but not GeoPackage.
- **All formats are parsed in the backend**, so coordinate systems, attribute types and geometry checks are handled in one place. Import needs a connection; preparation happens on desktop anyway.
  - `POST /field_observation/import/parse` is stateless and stores nothing. It returns a GeoJSON FeatureCollection in EPSG:4326 plus the source columns with detected types.
  - The reader is `pyogrio` (GDAL), which handles every format and transforms from each file's own coordinate system (often EPSG:25832). It still has to be checked that it installs in the Docker image (`python3.14-trixie-slim`). The fallback is the standard library (`json`, `sqlite3`, `xml`) + `pyshp`, with PostGIS doing geometry and transformation (`ST_GeomFromGeoJSON`, `ST_GeomFromKML`, `ST_GeomFromWKB`, `ST_Transform`).
  - Limits: a maximum file size (e.g. 50 MB) and number of features, and a longer `statement_timeout` than the default 10 s.
- **Flow:**
  1. Upload.
  2. Choose a projekt and **one observationstype for the whole file**.
  3. Map each source column to a typefelt, or leave it.
  4. Unmapped columns go to `custom_fields`, so nothing from the file is lost.
  5. A preview validates per row: values against the type's fields, and the geometry type against `geometry_types`.
  6. Valid rows are created. Invalid rows go in a report per row; it is not all or nothing.
- Imported feltobservationer are written to Dexie and sent with the normal overførsel, exactly like ones drawn by hand.
- **Import only creates.** Re-importing a plan revised in QGIS does not update existing feltobservationer. That would need a stable id per feature and rules for fieldwork already done. Until then, revisions are made in Field, or you delete and re-import before fieldwork starts.

### Parked, needs more thought
- **Status.** Should a feltobservation have a status at all? It might be derived from what has been filled in, or be a typefelt on the types that need it.
- **Static context data** (projekt boundaries, cadastral plots, old drawings). It might just be an observationstype with no fields, kept in the same table. The thing to settle is **volume**: a cadastral layer can hold thousands of features, and overførsel pulls everything visible to the user.

## Known PoC limitations
- The pull cursor can in theory skip a row whose transaction commits late with a lower `version`. Acceptable at PoC scale. The fix later is a snapshot-based cursor.
- A feltobservation moved to a projekt the device can't see stays as a stale local copy.
- A row the server rejects (no rights, invalid) is marked "afvist" on the device. Auto skips it; editing it or pressing **Overfør** retries it.
- `/observation` still renders inside Field's shell (login, release notice). It is not a separate app.
- Everyone sees the mode switcher; there is no Funktionsadgang flag and no shortcut from a lokationsvindue yet.

## Notes after shipping
Changes from the plan, made while building and testing the PoC:
- **Field's own top bar** instead of a separate bar, so the two modes look like one app. The projekt field sits on the map under it.
- **Modes:** a switcher in Field's `⋮` menu (Servicering ↔ Feltobservationer), the app reopening in the last mode (`src/features/fieldObservation/appMode.ts`), and a PWA shortcut to `/observation`. No crossover or flag yet, on purpose.
- **Map:** no zoom buttons; the user's position is always shown (`map.locate` with watch) instead of the locate control. Geoman is not used yet; points are made with the crosshair.
- **Layers:** the background-map button was replaced by the Baggrund/GIS-lag menu, reusing Explorer's catalog and GC2 proxy. Explorer's GIS layers use single-tile WMS (see Map layers).
- **Projekt field:** filters the map and is the default projekt for new feltobservationer, but only if the user can edit it.
- **Overførsel:** rejected rows (`dirty = -1`) are skipped by Auto, but **Overfør nu** retries them. The status bar became an icon with a popover.
- **Photos** are saved without **Gem**; the dialog says so and a toast confirms it.
- **Bug fixed during testing:** with raw `text()` SQL, asyncpg neither encodes Python dicts to jsonb nor decodes json columns. The API now sends JSON as text with `CAST(... AS jsonb)` and decodes `geom`, `properties` and `custom_fields` on the way out.
- **Not yet tested in the app:** the throttling and pause/resume scenario, two users and LWW, and the full demo sequence above.
