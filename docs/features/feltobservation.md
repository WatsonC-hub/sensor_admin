# Feltobservation (PoC)

Status: PoC built (2026-11-11), not merged. Placement decided: Field (2026-11-11). Fase 2 PoC in
progress. Branch/PR: `feature/feltobservation-poc`, `feature/feltobservation-fase2` (both repos)

**Decision (2026-11-11):** after the PoC, the stakeholders chose Field as the home for
feltobservationer. Fase 2 (below) builds typefelter, drawing and import on the same route and
schema.

## Goal

Consultants and underleverandører document what they find on site (drænbrønde, boringer, jordprøver,
vandløb): a geometry, notes and photos, optionally in a projekt. This PoC proves two things in
Field: a data model that works wherever the feature ends up (Field, Explorer or a standalone app),
and offline capture that stays usable on a connection that is slow, not just absent.

The PoC does not settle where the feature lives. It keeps the decision cheap: the data lives in its
own `register` schema, the UI lives on its own route, and nothing else in Field changes.

## Decisions this PoC rests on

- **Field writes, others read.** Feltobservationer are created and edited only through `python_api`.
  Explorer, GC2 and QGIS read them. See ADR 0002.
- **Own route, not a window.** The feature lives on `/observation` in
  `src/features/fieldObservation/`, with its own Leaflet map. This is a deliberate exception to ADR
  0001, so the feature is easy to move or remove until the placement decision is made. It reuses
  Field's top bar (`NavBar`) and base-layer factories, but not `Overview`/`WindowManager`.
- **Funktionsadgang `fieldObservations`** (added 2026-11-16, after the placement decision). A
  column `field_observations` in `sensor_app.feature_flags`, per user or organisation, read through
  `sensor_app.feature_flag_permissions` and sent by calypso-auth as `features.fieldObservations`.
  Off by default. It gates the route, the mode switcher and every `/field_observation` endpoint
  except `/ping`; it does not need IoT- or pejleboringsadgang.
- **Local-first.** On the device, IndexedDB (Dexie) is the source of truth. The UI never waits for
  the network. Overførsel is a separate process that is allowed to be slow.
- The model comes from Explorer's plan (`calypso-explorer`, branch `feature/register`,
  `docs/planning/field-documentation-plan.md`), moved to the `register` schema. Explorer's "Case" is
  Field's **projekt**.

## User flows

1. The user opens Feltobservationer: from **Skift til Feltobservationer** in Field's menu, from the
   PWA shortcut, or directly on `/observation`. The app remembers the last mode and reopens in it.
   The top bar is Field's own. The map shows the user's position and the feltobservationer from the
   user's projekter, read from the device. A projekt field at the top filters the map.
   - **Skift til Servicering** in the same menu goes back to the rest of Field.
2. The user taps **Ny feltobservation** (bottom right; icon only on mobile). A crosshair appears in
   the middle of the map, and the map centres on the GPS position. The user pans the map under the
   crosshair and confirms. The GPS accuracy is stored if the point is left at the GPS position.
3. The user picks an observationstype, optionally a projekt (the one chosen in the projekt field is
   suggested; "Intet projekt" is allowed), and writes a note and an optional intern note, then
   presses **Gem**. Photos can be added once the feltobservation is saved: each photo, and its
   comment, is saved the moment it is picked or edited, without **Gem**. Everything goes to the
   device only.
4. The user opens an existing feltobservation and edits the note, intern note, type or projekt, adds
   or deletes photos, or deletes the feltobservation. The geometry cannot be moved in the PoC.
5. An overførsel icon in the top bar shows the state, with a badge counting what is not overført. It
   opens a popover with the counts, the last success, warnings, the **Automatisk overførsel** switch
   and **Overfør nu**. In Auto mode, overførsel runs shortly after a change and on an interval.
   **Overfør nu** forces one attempt, and also retries rows the server rejected earlier.
6. On a bad connection, Auto pauses by itself; the icon turns orange and the popover says the
   connection is poor. Auto resumes by itself when the connection is good again, or the user presses
   **Overfør nu**. The user can also turn Auto off permanently.
7. A layers icon in the top bar opens two tabs: **Baggrund** (Luftfoto, which can be downloaded
   for offline use, Kort from Field, and Dataforsyningen's ortofoto with a choice of year) and **GIS-lag** (Explorer's
   GIS layer catalog, grouped as in Explorer, turned on and off with checkboxes). The choices are
   remembered on the device.
8. A colleague's device pulls the new feltobservation on its next overførsel and shows it.

## Rules and edge cases

**Access**

- A feltobservation with a projekt: readable if `project_no` is in the user's view list
  (`get_view_permissions`), and writable if it is in the edit list (`get_edit_permissions`).
  Everyone with edit rights in the projekt can edit any of its feltobservationer.
- A feltobservation without a projekt: visible to and editable by only its `created_by`. It is never
  published.
- Moving a feltobservation to another projekt requires edit rights on both the old and the new
  projekt.
- New SQL uses bound parameters.

**Ids and time**

- The client generates UUIDv4 ids for feltobservationer and photos. All writes are idempotent
  upserts on `id`.
- `created_at` and `updated_at` come from the device (capture time and edit time).
  `created_by`/`updated_by` come from the logged-in user on the server, never from the client. The
  server stores `received_at`.
- Pull uses a server-assigned `version` (one shared sequence for both tables, bumped by a trigger on
  every write), never device clocks.

**Conflicts**

- Last-write-wins per row on the device's `updated_at`. If the incoming row is older than the stored
  row, the server ignores it and returns its own row, and the device overwrites its copy.
- The history trigger keeps every version, so the losing write can be recovered by hand.
- Deletes are soft (`deleted_at`) and travel as tombstones.

**Overførsel**

- Each local row has a `local_rev` counter. After a successful push, `dirty` is cleared only if
  `local_rev` has not changed, so an edit made during a push is not lost.
- Push runs in two passes:
  1. All dirty feltobservation and photo metadata in one batch request.
  2. Photo bytes, one request per photo, oldest first. A failed photo never blocks metadata. A
     photo's row is only created on the server once its feltobservation exists there.
- Every request has a hard timeout: about 15 s for metadata, and for photos scaled to the size.
  After 2 failures or timeouts in a row, Auto pauses.
- While paused, `GET /field_observation/ping` runs every 60 s. Auto resumes after two pings in a row
  under about 2 s. The exact values are tuned at build time.
- `navigator.onLine` and the Network Information API are not used as signals: they are unreliable,
  and the API does not exist on iOS.
- Overførsel runs only while the app is open. iOS has no Background Sync.

**Photos**

- Resized on the device to about 2048 px on the long edge, JPEG quality ~0.8.
- Stored in Dexie as an `ArrayBuffer` plus a mime type, not as a Blob (WebKit bug 235687: re-saving
  a Blob read back from IndexedDB fails). A Blob is made only to upload or show the photo.
- Photos taken on the device keep their bytes locally. Other photos are shown as thumbnails through
  the image proxy, only when online.

**Data safety**

- Call `navigator.storage.persist()` on first use. Show a warning when `persisted()` is false.
- Warn before logout or clearing data while "N ikke overført" is above 0.
- On iOS, the PoC must be installed on the Home Screen. In a Safari tab, IndexedDB can be cleared
  after 7 days without use.

## Data / API

**Schema `register`** (backend: `python_api`; a SQL script reviewed and applied by hand, no Alembic)

- `observation_type`: `id`, `schema_key` (unique, stable code key), `name`, `icon`, `color`,
  `geometry_types` (text[]; null = any). Seeded with `generel` and `draenbroend`.
- `field_observation`:
  - `id` uuid PK (client)
  - `project_no` varchar(30) **null**, FK → `sensor.sensor_projects(project_no)`
  - `type_id` FK → `observation_type`, not null
  - `geom geometry` not null. CHECK SRID = 25832. CHECK type ∈ Point, LineString, Polygon; Z
    allowed.
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
- `field_observation_history`: one row per insert, update or delete on the two tables above (table
  name, row id, operation, row as jsonb, time). Filled by a trigger. No UI.
- Photo bytes go to S3 bucket `watsonc-images` under
  `field_observation_images/{observation_id}/{image_id}.jpg`. Thumbnails come from the existing
  image proxy.
- Later, not in the PoC: one published view per geometry type (`field_observation_point`, `_line`,
  `_polygon`) without `internal_note` and without rows that have no projekt. GC2 and Explorer read
  these views. QGIS gets a GeoPackage per projekt instead (see Distribution), because colleagues
  have no database access.

**Endpoints** (new router `/field_observation` in `python_api`)

- `GET /field_observation/types`: the observationstype catalog.
- `GET /field_observation/projects`: `project_no` + `project_title` for the user's edit list.
- `GET /field_observation/changes?since=<version>`: feltobservationer and photo metadata visible to
  the user with `version > since`, tombstones included, paged. Returns the new cursor.
- `POST /field_observation/sync`: a batch of feltobservation and photo-metadata upserts. Returns,
  per row, `applied` or `stale` together with the server row, or `forbidden`, `invalid` or
  `pending_upload` (photo metadata whose bytes are not uploaded yet).
- `PUT /field_observation/{id}/image/{image_id}`: multipart photo bytes + metadata. Creates the row
  if it is missing. Idempotent.
- `GET /field_observation/ping`: a tiny health check used to measure round-trip time.
- The API takes and returns GeoJSON in EPSG:4326 and converts to and from 25832 in SQL.

**Device** (Dexie database, separate from the TanStack Query cache)

- Tables: `observations`, `images` (with bytes), `projects`, `types`, `meta` (cursor, overførsel
  mode).
- The UI reads feltobservationer through `useLiveQuery`; they never go through TanStack Query. Only
  the reference data for the map does: Explorer's GIS layer catalog and the ortofoto years.

**Map layers**

- Explorer's GIS layer catalog: `GET /explorer/api/gis-layers/gis`. The layers are drawn as WMS
  through Explorer's GC2 proxy (`/explorer/gc2/wms/watsonc/<schema>`, `LAYERS=<schema.table>`) with
  `SingleTileWms` (`src/features/map/singleTileWms.ts`, ported from web_projects): one image per
  viewport instead of tiles, which suits GC2/MapServer.
- **Kortlag panel** (`LayerPanel.tsx`, 2026-11-16): on desktop a panel docked beside the map that
  stays open while you work; on a phone full screen with a close button. Three sections:
  Baggrundskort, **På kortet** (shown projektlag, then GIS layers top first, each with
  synlighed (0–100 %), Flyt op/ned and its GC2 legend from `/explorer/gc2/api/v1/legend/html/watsonc`),
  and **Tilføj lag** (search over layer and group names, Explorer's groups collapsed with
  "on/total", the projekt's projektlag first). Offline, the GIS layers are marked as not shown.
- **Zoom til projekt** (2026-11-17): picking a projekt in the projekt field zooms the map to its
  extent (its feltobservationer plus its shown projektlag, max zoom 17), once that data has loaded.
  The projekt restored from the device on page load does not move the map. A button in the map
  controls on the left zooms to the projekt again; it is hidden when the projekt has no geometry.
- `/explorer` is a same-origin proxy to `https://explorer.watsonc.dk`, so no CORS is needed. **It
  only exists in the vite dev server; production needs the same rule in front of Field.**
- The ortofoto is tiled WMS straight from Dataforsyningen (`orto_foraar_DAF`, layer
  `geodanmark_<year>_12_5cm`), as Explorer does it. The URL and token are copied from Explorer,
  which has no endpoint for its background maps yet. Explorer's vector background map is left out.
- **Luftfoto** (2026-11-17), the default baggrundskort: the newest ortofoto as WMTS tiles
  (`orto_foraar_webm_DAF`, web mercator), which can be downloaded for offline use. In Kortlag,
  "Hent det viste område" fetches the area on screen into IndexedDB (`leaflet.offline`): the 4
  zoom levels above the view plus levels down to a chosen Detaljeniveau, each previewed at a fixed
  street in Aarhus with parked cars so the detail can be judged by known sizes. A tile that is not
  stored and cannot be fetched is drawn from the nearest stored coarser tile, enlarged. Older
  years stay WMS-only ("Ortofoto, alle årgange") and cannot be downloaded. Debug:
  `localStorage.luftfotoDebug = '1'` labels each tile with its source.
- The rest of Field's offline behaviour is unchanged.

## Demo / acceptance

1. A phone (installed PWA) and a laptop, both logged in on the same projekt.
2. On the laptop, DevTools throttling at about 20 kbps with 3 s latency. Creating a feltobservation
   with two photos stays instant. Auto pauses and the banner appears. **Overfør** pushes it through
   once the throttling is relaxed.
3. The phone pulls and shows the feltobservation.
4. Edit the same feltobservation on both devices. The later edit wins, and both versions are in the
   history table.
5. Open `register.field_observation` in QGIS as an ordinary PostGIS layer, read-only. The data does
   not depend on the app.

## Out of scope

- Offline tiles for GIS layers and older ortofoto years (only the newest Luftfoto can be downloaded)
- Drawing lines and polygons, and moving geometry
- Published views, GC2 and the Explorer layer
- Customer access per row
- Editing from QGIS
- Type-specific forms (Explorer's Zod registry on `schema_key`)
- History UI
- A Funktionsadgang flag
- Boreprofiler and lab results: they get their own long tables later, as in Explorer's plan
- Registreringsstatus and dynamic styling
- Reports, uploaded projektlag, tracking where the user walks, dGPS integration, bulk import (see
  Fase 2)
- Polished Danish UI copy

## Fase 2: forberedelse og import (decided, PoC in progress)

### Why

Feltobservationer are often prepared before anyone goes out. For example, a consultant marks out
similar-looking areas and a sample point in each one at the desk, and in the field the team fills
those in: a photo, a note, the soil type. Things found that nobody planned (a well) are created on
the spot, as in the PoC. The preparation is done in QGIS today, and may still be. Simple drawing
tools in Field can take some of that work over.

### Decisions

- **Preparation happens in Field too.** Field is used on desktop by many people as well as in the
  field. Preparation is mostly a desktop experience, but desktop and mobile are equally important.
  ADR 0002 still holds: every write goes through `python_api`, with history and LWW.
- **No "planned → done" flow and no status column (yet).** A prepared feature is just a
  feltobservation of a given observationstype. The type decides which fields it has, and the
  fieldwork fills them in.
- **Links between feltobservationer only as relation typefelter** (see Feltgrupper og relationer). No `parent_id` and no link table. A sample point and its area are still two independent feltobservationer.
- **One create function, two input methods.**
  - Desktop: Geoman, clicking to draw points, lines and polygons, and its edit mode to move points
    and corners.
  - Mobile: the crosshair tool (Tilføj punkt / Fortryd / Færdig) for all geometry types, and
    Geoman's edit mode for moving.
  - Both end in `createObservation` / `updateObservation` with a GeoJSON geometry.
- **Typefelter are data, not code.**
  - Each observationstype has a field list in `observation_type.fields` (jsonb), e.g.
    `[{key, label, kind, options?, archived?}]`.
  - Kinds: text, number, select, boolean, date.
  - A select's `options` are `[{value, label}]` (decided 2026-11-18): `value` is stored in
    `properties`, `label` is shown in the dropdown and in Vis. Options are append-only like
    typefelter: a value never changes and is never reused, but its label can be renamed.
    Import matches either the value or the label. (`register_option_labels.sql` converted the
    old string lists, keeping each string as both value and label.)
  - Field builds the form and the zod validation from the definition at runtime. The server
    validates `properties` against the same definition.
  - A type that needs something special (e.g. boreprofiler with layers) can later get its own
    component through `schema_key`.
- **Types are global** to start with. A `project_no` on `observation_type` can come later if the
  list gets cluttered.
- **Types are maintained directly in the database** for now. There is no editor, because types
  rarely change once defined.
- **Typefelter are append-only.**
  - A field's `key` and kind never change, and a key is never reused. The `label` can be renamed.
  - Removing a field means setting `archived`: it disappears from the form for new data, and
    existing values are shown read-only.
  - No data migration. A device with an old definition only uses keys that still exist, so its
    writes stay valid.
  - The server accepts archived keys and rejects unknown ones.

### Feltgrupper og relationer (decided 2026-11-12)
Two new kinds of typefelt, both stored in `properties`. No new tables for the data, so overførsel, history and LWW are unchanged.

- **Feltgruppe (`kind: "group"`):** a repeatable sub-form, defined once in `register.field_group` and referenced by key from any type's typefelt. The value is a list of rows, e.g. `"geologi": [{"bund_mut": 0.5, "jordtype": "Muld"}, {"bund_mut": 1.0, "jordtype": "Sand"}]`.
  - The server copies the group's fields into the types it sends, so the device needs no extra table.
  - The group's fields follow the typefelt rules (append-only, `archived`). Changing a group changes every type that uses it.
  - Option: `increasing` on a number field: the value must grow from row to row.
  - **Nothing is required** (decided 2026-11-12): a feltobservation may be prepared and filled in
    later, so validation only checks that what is entered is valid. `min_items` was tried and
    removed (`register_no_required.sql`). Whether a feltobservation is complete belongs to the
    parked status question, not to validation.
- **Geologi** is the first feltgruppe. Each row is one layer, top down, and stores the **bottom of the layer in m u.t.** (meters under terrain). The top is the bottom of the row above, or 0 for the first row. "Sand all the way to 1 m" is one row with 1.0; "muld to 0.5, then sand to 1.0" is 0.5 muld and 1.0 sand. The form shows each row's interval (0–0,5 m, 0,5–1 m). Used by Fosforprøve and Boreprofil (not Kulstofprøve).
- **Relation (`kind: "relation"`, `target_types`: schema_keys):** holds another feltobservation's id, on the side that has many. A dræn/ledning points to its one brønd; the brønd's list of ledninger is computed on the device.
  - The database does not enforce the reference, and the server only checks that the value is a uuid: the target may not have reached the server yet. A missing target shows as "Ukendt eller slettet".
  - A new line whose end is within 2 m of a brønd is connected to it automatically. Geoman snaps to the brønd on desktop; on mobile, Tilføj punkt snaps to a point within 24 px of the crosshair.
  - A link table (`field_observation_link`) is only for a relationship that needs data of its own, or is many-to-many with no natural owner.
- **Direction of a line is computed, never stored:** from the end nearest its brønd to the far end, shown as e.g. "NØ (47°)". Without a brønd, from the first to the last point drawn.
- **Explorer/QGIS** will need published views that unpack groups (`jsonb_array_elements`, with fra/til by a running sum) and relations. Not built yet.

### Compass on the position dot
- A **Vis retning** button (touch devices only) turns on a cone on the position dot that turns with the phone, from `DeviceOrientationEvent` (`deviceorientationabsolute` on Android, `webkitCompassHeading` on iOS, which asks permission on the tap).
- The phone's compass is magnetic; steel nearby (cars, well lids, pipes) can be off by 10–20°. It is for orientation, not surveying.

### Import

- **Formats:** GeoJSON, zipped Shapefile, KML and GeoPackage (QGIS's default). Explorer's parser
  covers the first three, but not GeoPackage.
- **All formats are parsed in the backend**, so coordinate systems, attribute types and geometry
  checks are handled in one place. Import needs a connection; preparation happens on desktop anyway.
  - `POST /field_observation/import/parse` is stateless and stores nothing. It returns a GeoJSON
    FeatureCollection in EPSG:4326 plus the source columns with detected types.
  - The reader is `pyogrio` (GDAL), which handles every format and transforms from each file's own
    coordinate system (often EPSG:25832). It still has to be checked that it installs in the Docker
    image (`python3.14-trixie-slim`). The fallback is the standard library (`json`, `sqlite3`,
    `xml`) + `pyshp`, with PostGIS doing geometry and transformation (`ST_GeomFromGeoJSON`,
    `ST_GeomFromKML`, `ST_GeomFromWKB`, `ST_Transform`).
  - Limits: a maximum file size (e.g. 50 MB) and number of features, and a longer
    `statement_timeout` than the default 10 s.
- **Flow:**
  1. Upload.
  2. Choose a projekt and **one observationstype for the whole file**.
  3. Map each source column to a typefelt, or leave it.
  4. Unmapped columns go to `custom_fields`, so nothing from the file is lost.
  5. A preview validates per row: values against the type's fields, and the geometry type against
     `geometry_types`.
  6. Valid rows are created. Invalid rows go in a report per row; it is not all or nothing.
- Imported feltobservationer are written to Dexie and sent with the normal overførsel, exactly like
  ones drawn by hand.
- **Import only creates.** Re-importing a plan revised in QGIS does not update existing
  feltobservationer. That would need a stable id per feature and rules for fieldwork already done.
  Until then, revisions are made in Field, or you delete and re-import before fieldwork starts.

### Projektlag (decided 2026-11-12)
Reference layers for one projekt (a projekt area, old drawings), shown on the map but never registered. This settles the earlier "static context data" question: they are not feltobservationer.

- **Data:** `register.project_layer` (name, `project_no` NOT NULL, Leaflet style as jsonb, soft delete) and `register.project_layer_feature` (geometry in 25832 and the file's columns as `properties`). Script: `register_projektlag.sql`.
- **Upload:** the import flow, choosing **Projektlag (kun til visning)** in step 2: projekt (required), name and colour. No type and no column mapping. `POST /field_observation/layers`.
- **Style:** one Leaflet path style per layer. A GeoPackage saved from QGIS carries its style in `layer_styles`; the first symbol of its SLD (fill, outline, width, opacity) is used unless the user picks a colour. Rule-based and categorised QGIS styles are not translated. KML styles are not read yet.
- **Rights:** everyone with edit rights on the projekt can upload and delete; view rights to see.
- **Loading:** only for the projekt chosen in the projekt field (`GET /field_observation/layers?project_no=`). Stored on the device (Dexie), so they show offline once fetched. No overførsel, LWW or history: they are written online only.
- **Map:** a **Projektlag** tab in the layer menu with a checkbox per layer (shown unless hidden, remembered on the device) and delete. Drawn above Explorer's GIS layers and below the feltobservationer, not clickable.
- **Order** (decided 2026-11-19, from field feedback): under **På kortet**, up and down arrows move a projektlag among the other projektlag; they stay above the GIS layers. The order is remembered per device, not shared on the projekt. A new projektlag is drawn on top.

### Vis og Rediger (decided 2026-11-12)
- Clicking a feltobservation opens **Vis**: a compact read-only view (typefelter as label–value, geologi as a small Fra–til table, relations as links, direction, connected feltobservationer, ekstra felter from import, and photo thumbnails). On mobile it is a sheet over the lower part of the map.
- **Rediger** is the form. A Vis/Rediger switch in the window's header changes between them; switching to Vis with unsaved changes asks first.
- **Redigeringstilstand:** a pencil button on the map. When on, clicks open straight into Rediger (useful for preparation at the desk). Remembered on the device; off by default. Placed on the map for now; the UI overhaul will decide its final place.
- A new feltobservation is always in Rediger, and **photos can be added before the first save**. Photos picked in Rediger are kept in the form and saved with **Gem**. Already saved photos: comment and delete still apply at once.
- **Gem saves everything and closes the window**: the user is most likely done and back on the map.

### Projekt vælges én gang (decided 2026-11-12)
- The projekt chosen in the projekt field on the map is the projekt of every new feltobservation. The window has no Projekt field then; its title shows where it lands ("Ny feltobservation · 1234"). A technician who wants another projekt switches the map to it anyway, to see what is already registered there.
- Only when no projekt is chosen, or the user can't edit the chosen one, does the window show the Projekt field, with the warning that without a projekt only the creator can see it.
- Vis leaves out the Projekt row when it is the chosen projekt.
- **Flyt til andet projekt** is a rare action, in the **Flyt** menu in Rediger next to **Flyt på kortet**: pick one of the projekter the user can edit. The feltobservation then leaves the map; a toast offers **Vis projekt**. The server checks edit rights on both projekter as before.
- Intern note is the last field in the form.

### Kortstil og signaturforklaring (decided 2026-11-12)
- **Style is data on the type:** `observation_type.style` (jsonb, script `register_style.sql`) with `icon`, `color`, optional `weight`/`dashArray`/`fillOpacity` for lines and flader, and `rules`.
- **Rules:** the first rule that matches sets colour and/or icon. A rule tests one typefelt with `equals`, `empty` or `notEmpty`, and has a `label` for the signaturforklaring. Example: Fosforprøve (and Kulstofprøve) is red by default ("Ikke udtaget") and green when `proeve_udtaget` is true.
- **Points** are a round badge in the colour with the icon in white. Not overført: a dashed orange ring. Lines and flader keep their colour; not overført is drawn dotted.
- **Lines and flader read as feltobservationer** (decided 2026-11-18): a white outline under them, like the white ring on a point badge, and a smaller badge with the type's icon, halfway along a line or inside a flade (the middle of its widest stretch, so concave shapes and holes work). The badge opens the feltobservation like the shape does and gets the dashed orange ring when not overført. Outline and badge are hidden while the geometry is edited. In the signaturforklaring, line and flade swatches carry a mini badge (a white outline can't be seen on its white background).
- **Icons are a fixed library** of local files in `public/fieldObservation/icons`, with a strict standard (24×24 viewBox, single-colour filled paths, no styles or scripts; see the README there). They are recoloured with a CSS mask, so the SVG is never inlined, and they are precached for offline use. Most come from Material Icons; soil, manhole and borehole are drawn.
- **Signaturforklaring:** a button at the bottom left opens a panel with each type on the map (icon or line/flade, name, count) and, under it, each rule variant. Checkboxes hide a type or a single variant (e.g. show only fosforprøver not yet taken). Projektlag for the chosen projekt are listed too, sharing their checkboxes with the layer menu. Hidden choices are remembered on the device. The panel scrolls, so a long list works on a phone. To show just one thing fast (decided 2026-11-23): a double tap on a row shows only that row within its group (Feltobservationer or Projektlag) and hides the rest of the group; on a variant it shows only that variant of that type. Each group heading has a tri-state checkbox that shows or hides the whole group. Both only change what is in the legend now; choices for other projekter's types and projektlag are kept.
- **Labels** (decided 2026-11-19, from field feedback): only some types need a name on the map, so the type says which typefelt is its label: `style.labelField` (script `register_label.sql`). Only text, number and select typefelter give a label; no `labelField` or an empty value means no label. For now only Fosforprøve and Kulstofprøve have one: their typefelt **Navn** (`navn`, added to the database by hand earlier). Labels are drawn to the right of the badge (on a line or flade, of its small badge) from zoom 16, and hidden further out.

### Parked, needs more thought

- **Status.** Should a feltobservation have a status at all? It might be derived from what has been
  filled in, or be a typefelt on the types that need it.
- **Large shared context data** (e.g. cadastral plots for a whole municipality). Projektlag cover
  data per projekt; layers shared across projekter are better served as Explorer GIS layers.

### Spike: GIS layers as vector data, offline (2026-11-23)

Can an Explorer GIS layer be kept on the device for the projekt's area, like a projektlag? Tried with
**Matrikler** (`datagrundlag.matrikel_lodflade`, the current jordstykker with matrikelnummer and
ejerlavsnavn, added to Explorer's datagrundlag sync for this; calypso-explorer PR #1). Branch
`spike/matrikler-vector`.

- **How:** when Matrikler is on in Kortlag and a projekt is chosen, Field asks GC2's SQL API (through
  Explorer's `/gc2` proxy) for the polygons in the projekt's extent plus 500 m, in EPSG:4326, and
  stores them in Dexie (`vectorLayers`, one record per layer and projekt). The map draws them on one
  canvas in the GIS pane instead of the layer's WMS, so they show offline too. Without a projekt, an
  extent or a stored copy, the layer stays WMS. Only layers listed in `VECTOR_LAYERS`
  (`api/useVectorLayers.ts`) work this way, with a fixed style each. Timings go to the console
  (`[vektorlag]`).
- **Numbers** (matrikler, measured from outside the app; the proxy gzips):

  | Area | Features | JSON | On the wire | Time |
  |---|---|---|---|---|
  | Land, 2 × 2 km | 318 | 0.2 MB | 0.04 MB | 1.3 s |
  | Landsby og mark, 3 × 3 km | 1,324 | 0.7 MB | 0.16 MB | 2.0 s |
  | By, 2.5 × 2.8 km (Aarhus C) | 4,388 | 2.4 MB | 0.5 MB | 3.6 s |
  | Storby, 5 × 5 km (Nørrebro) | 15,450 | 7.9 MB | 1.7 MB | 11.4 s |

- **Still to try in the app:** how long storing and drawing take on a phone (logged), panning and
  zooming with 15,000 polygons on canvas, and the layer offline after a reload.
- **Not in the spike:** labels and clicking a matrikel; refreshing on **Overfør nu** (it refetches
  once a day, or when the projekt's extent changes); old copies are never removed; styles are
  written in code, not read from GC2; more than 20,000 features are cut off; a projekt with no
  feltobservationer or projektlag has no extent, so nothing is fetched. Fewer coordinate decimals
  (e.g. `ST_ReducePrecision`) would make the JSON smaller.

## Distribution: GeoPackage per projekt (decided 2026-11-23, endpoint built)

### Why

Colleagues work with the feltobservationer in QGIS afterwards, for example to make maps and
reports. They have no database access, so QGIS can't read the `register` tables or views directly.
They get **one GeoPackage per projekt** with the projekt's feltobservationer as ordinary, styled
QGIS layers, read-only.

### Decisions

- **Internal use first.** The goal is QGIS for Watsonc's own staff. Customers and other data
  platforms come later and may need other channels (published views in GC2, an API with tokens).
- **Two steps, one build function:**
  1. **Now:** a **Hent som GeoPackage** button in Field for the chosen projekt. The file is built
     on request and downloaded.
  2. **Later:** a QGIS plugin. It logs in to our system, lists the user's projekter, and fetches
     the chosen projekt's file. The API checks rights and answers with a pre-signed S3 URL that is
     valid for a few minutes, so S3 stays private and users need no AWS keys. **Hent seneste**
     downloads a new copy to a local folder and reloads the layers. A local copy is used instead of
     reading the file over HTTP (`/vsicurl/`), because GDAL caches what it reads and doesn't notice
     a replaced file, and the file could be replaced in the middle of a read. The local copy also
     works offline.
- **Read-only.** Feltobservationer are still written only through Field (ADR 0002). Editing from
  QGIS is parked (see below).
- **Flattening in Python, not in database views.** One module in `python_api` reads the types and the
  projekt's rows and writes the layers with `pyogrio` (already used by import). No SQL script, and
  nothing to regenerate when a type changes. GC2 views can later be generated from the same module.
- **Few new points from QGIS go through import.** If a colleague finds a missing point while
  working in QGIS, they draw it in a layer with the same columns, save it as a GeoPackage and
  import it in Field. Import pre-matches columns to typefelter by key or label (`autoMapping` in
  `importMapping.ts`), so the export's column names make the mapping automatic. Normally, new
  feltobservationer are made in Field.

### Content of the file

- **Coordinate system:** EPSG:25832.
- **What is left out:**
  - intern note;
  - soft-deleted rows;
  - the history table.
  
  Feltobservationer without a projekt can't be in a projekt file anyway.
- **One layer per observationstype and geometry type.** A QGIS layer holds one geometry type.
  - Table name: the type's `schema_key`. `_punkt`, `_linje` or `_flade` is added only when the type
    has more than one geometry type in the projekt (e.g. `generel` with `geometry_types` null).
  - Layer title (GeoPackage `identifier`): the type's name, e.g. "Drænbrønd".
  - Only types with feltobservationer in the projekt get a layer.
  - Table names spell out æ, ø and å as ae, oe and aa, and are made unique.
- **Standard columns** on every layer:
  - `id` (uuid);
  - `projekt`;
  - `type` (the observationstype's name, useful when layers are merged);
  - `note`;
  - `noejagtighed_m` (`position_accuracy_m`);
  - `antal_billeder`;
  - `oprettet` and `opdateret` (device times, written as Danish local time);
  - `oprettet_af` and `opdateret_af` (the user's name from `users.user_display_name`, not the id).

  A typefelt whose key equals a standard column gets `_felt` added to its column name.
- **Typefelter as columns:**
  - Column name: the typefelt's `key`, which is stable because typefelter are append-only. The
    `label` is set as the column's alias in the layer style, so QGIS shows Danish names.
  - Archived typefelter are included.
  - Column types follow the kind:

    | Kind | Column type | Value |
    |---|---|---|
    | number | Real | the number |
    | boolean | Boolean | true/false |
    | date | Date | the date |
    | text | Text | the text |
    | select | Text | the option's **label** (import accepts label or value) |
    | relation | Text | the target feltobservation's uuid |

- **Ekstra felter** (`custom_fields` from import): one JSON text column, `ekstra_felter`.
- **Feltgrupper:** one table without geometry per feltgruppe, e.g. `geologi`, shared by every type
  that uses it. Columns:
  - `observation_id`;
  - `nr` (the row's place in the list, from 1);
  - then the group's own fields, by the same rules as typefelter.

  A number field marked `increasing` (geologi's `bund_mut`) is the bottom of an interval, so a
  `fra` column comes before it with the bottom of the row above (0 for the first row). For geologi
  that gives `fra` and `bund_mut` as the layer's top and bottom in m u.t.
- **Photos:** a table without geometry, `billeder`, with these columns:
  - `observation_id`;
  - `note`;
  - `taget` (`taken_at`);
  - `url`: the photo as uploaded, `https://<Field's domain>/static/images/<s3_key>`;
  - `thumb_url`: the same with `?width=640&height=640`.

  `/static/images` goes to CloudFront and needs no login, so QGIS can open the links. Photos are not
  embedded, so the file stays small. Anyone with the file can open the photos; that is acceptable
  for internal use, but must be revisited before customers get the file.
- **Projektlag:** one layer per projektlag in the projekt, named after the projektlag, with the
  file's own columns (the union of the keys in `properties`) and its Leaflet style translated.
- **Styles:** the GeoPackage gets a `layer_styles` table with one default style (QML) per layer,
  which QGIS applies when the layer is opened. It is generated from `observation_type.style`:
  - colour;
  - `rules` as rule-based categories, with each rule's `label`;
  - `weight`, `dashArray` and `fillOpacity` on lines and flader;
  - `labelField` as labels;
  - column aliases;
  - the photo links shown as images in the feature form.

  In v1, points are coloured circles. Field's icons can come later, embedded as SVG.
- **Om filen:** a table without geometry, `om_filen`, with one row:
  - projekt number and title;
  - when it was built (`hentet`);
  - number of feltobservationer;
  - the highest `version` in the data.

  The plugin can later compare that `version` with the server to see whether the file is out of
  date.

### API

- `GET /field_observation/projects/{project_no}/export.gpkg`. It requires **view rights** on the
  projekt (`get_view_permissions`) and the `fieldObservations` Funktionsadgang, like the rest of the
  router.
  - The file is written to a temporary file and returned as a download named
    `feltobservationer_<project_no>_<date>.gpkg`.
  - A projekt without feltobservationer still gives a file, with only `om_filen` and any projektlag.
- Later, for the plugin, the same function writes `s3://…/<project_no>.gpkg` some minutes after the
  projekt's last change, and an endpoint hands out the pre-signed URL. The plugin's login is not
  decided: an OAuth/OIDC browser login if calypso-auth can offer it, otherwise a personal access
  token made in Field.

### Field

- A **Hent som GeoPackage** button for the chosen projekt. Where it goes (Kortlag panel or by the
  projekt field) is decided when it is built.
- It is disabled when no projekt is chosen, and offline.
- The file comes from the server, so feltobservationer that are not overført are not in it. The
  button warns when there are some for the projekt.

### Not now

- **Editing from QGIS (parked).** It is possible in theory with Mergin Maps' `geodiff`:
  1. The plugin keeps an untouched copy of the downloaded file.
  2. It compares that copy with the edited one.
  3. It sends the changes, field by field, to the API, where rights, validation and history apply as
     for Field.

  The S3 file would never be merged into; it is always rebuilt from the database. This needs:
  - a new patch endpoint with conflict checks per field. Last-write-wins per row would let a bulk
    edit in QGIS overwrite notes from the field;
  - translation back from flat columns and feltgruppe tables;
  - a report of rejected rows.

  Not worth it now: colleagues mainly need to view, and new points go through import.
- Published views for GC2 and Explorer, and distribution to customers or other data platforms.
- Embedded photos and Field's icons in the styles.

### Status (2026-11-23)

- **Endpoint built** in `python_api` (`app/field_observation/export.py`, route in `router.py`),
  with tests that build a file from sample data. Geometry goes out as 2D (`ST_Force2D`); Z values
  are dropped. The data is read in one REPEATABLE READ snapshot with the import's 60 s
  `statement_timeout`.
- **Checked in QGIS 4.0.2** (headless, on a sample file):
  - every table opens;
  - the styles from `layer_styles` are applied by themselves;
  - the rule style, the labels and the column aliases come through;
  - the photo field is set up as an image.
- **Field button:** not built.

### Still to verify

- The export's SQL against the real database. In particular, the join to `users.user_display_name`
  compares the ids as text, because the column types weren't checked.
- That a photo link opens outside Field without a login (paste one into a private browser window).
- That QGIS's feature form actually loads and shows the photo from the link. Only the widget setup
  was checked.
- How long building takes for the largest projekt.
- The layer order when all layers are added at once (points should lie above lines and flader).

## Known PoC limitations

- ~~The pull cursor can skip a row whose transaction commits late with a lower `version`.~~
  Fixed 2026-11-16: each write stores its transaction id (`change_xid`), and `/changes` returns
  the rows whose transaction became visible between the previous pull's snapshot and the current
  one (`pg_visible_in_snapshot`), paged by version within that window. The cursor is opaque to
  the device (`app/field_observation/changes.py`).
- ~~`/sync` writes one row at a time (two queries per row).~~ Fixed 2026-11-16: checks run in
  Python, then each table is written in one statement and read back in one query. If the batch
  statement fails as a whole, the rows are written one by one, so only the bad row is refused.
- A feltobservation moved to a projekt the device can't see stays as a stale local copy.
- A row the server rejects (no rights, invalid) is marked "afvist" on the device. Auto skips it;
  editing it or pressing **Overfør** retries it.
- `/observation` still renders inside Field's shell (login, release notice). It is not a separate
  app.
- No shortcut from a lokationsvindue to Feltobservationer yet.

## Notes after shipping

Changes from the plan, made while building and testing the PoC:

- **Field's own top bar** instead of a separate bar, so the two modes look like one app. The projekt
  field sits on the map under it.
- **Modes:** a switcher in Field's `⋮` menu (Servicering ↔ Feltobservationer), the app reopening in
  the last mode (`src/features/fieldObservation/appMode.ts`), and a PWA shortcut to `/observation`.
  No crossover or flag yet, on purpose.
- **Map:** no zoom buttons; the user's position is always shown (`map.locate` with watch) instead of
  the locate control. Geoman is not used yet; points are made with the crosshair.
- **Layers:** the background-map button was replaced by the Baggrund/GIS-lag menu, reusing
  Explorer's catalog and GC2 proxy. Explorer's GIS layers use single-tile WMS (see Map layers).
- **Projekt field:** filters the map and is the default projekt for new feltobservationer, but only
  if the user can edit it.
- **Overførsel:** rejected rows (`dirty = -1`) are skipped by Auto, but **Overfør nu** retries them.
  The status bar became an icon with a popover.
- **Photos** are saved without **Gem**; the dialog says so and a toast confirms it.
- **Bug fixed during testing:** with raw `text()` SQL, asyncpg neither encodes Python dicts to jsonb
  nor decodes json columns. The API now sends JSON as text with `CAST(... AS jsonb)` and decodes
  `geom`, `properties` and `custom_fields` on the way out.
- **Field feedback (2026-11-19):** on a phone or tablet, Rediger has **Tag billede** (`capture="environment"`, opens the camera; Android 14+'s photo picker has no camera) next to **Vælg billede**. Projektlag are fetched again on every forced overførsel run (app open, **Overfør nu**) and, on automatic runs, once they are older than 5 minutes; before, a new projektlag only showed after a reload.
- **Not yet tested in the app:** the throttling and pause/resume scenario, two users and LWW, and
  the full demo sequence above.
