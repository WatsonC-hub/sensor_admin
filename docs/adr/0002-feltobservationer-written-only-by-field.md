# Feltobservationer are written only by Field; other apps read them

Feltobservationer could be captured in Calypso Field, Calypso Explorer, or both. Neither app was
built for it. Field's technicians service equipment, and Explorer is for exploring data. If both
apps get capture, both need offline sync, photo handling and conflict rules, and two clients will
drift apart on the same rows.

We decided that feltobservationer are created and edited only through `python_api`, the backend
behind Field. They are stored in their own `register` schema. Explorer, GC2, QGIS and customers read
them, and nothing else writes to them. The rule applies to "small" edits too: Explorer does not get
"just one edit button". If capture has to move out of Field later, it moves as a whole to a
standalone app on the same API and tables. It is not split between apps.

Forberedelse (drawing and importing feltobservationer before fieldwork, mostly on desktop) also
happens in Field, through the same API.

Update 2026-11-11: after the PoC, the stakeholders confirmed Field as the home for
feltobservationer. This ADR's rule is unchanged.

## Consequences

- Offline sync, conflict handling (last-write-wins per row, with a history table) and photo upload
  exist in one client only.
- Explorer shows feltobservationer as a read-only GC2 layer, with no feltobservation code of its
  own. Customers and QGIS read the same published views, which leave out intern note and
  feltobservationer without a projekt.
- QGIS editing, if it comes, must go through the API, so it doesn't bypass history and LWW.
- The `register` schema and the `/observation` route are kept separate from the rest of Field, so
  the capture UI can be moved without moving the data.
