# One row per tilknytning in itinerary_loc_id_history

A tur's history is stored as one row per tilknytning in `sensor_drift.itinerary_loc_id_history`. A row is inserted when a lokation is put on a tur. It is updated once when the lokation leaves the tur: `ended_at`, `ended_by` and `end_event` (besøgt, fjernet, frigivet or flettet_ud). Nothing else rewrites the rows. In particular, merging two ture closes the old rows and inserts new ones, instead of moving the rows to the target tur.

The rows keep the shape the code from before Turhistorik wrote, so old and new backends can run side by side. `done` keeps its old meaning: it is true only when the last opgave in Feltarbejde at the lokation was finished. A lokation that is removed or moved gets a row without a tur after it, as before, and `done` stays false. A tilknytning is open while it is the lokation's newest row, has a tur, has `done = false` and has no `end_event`.

The first version set `done = true` on every ending. That changed what `done` meant for anyone reading the table directly (for example queries that read `done = true` as "visited"), so it was reverted. `2026-11-itinerary-history-restore-done.sql` restores the rows.

The view `itinerary_loc_id_relation` (the newest row per lokation, where `done` is false) is unchanged. It still answers "which tur is this lokation on now" for the map, the lokation lists and the turforberedelse. The history queries for afsluttede ture and the Turforløb are plain selects on the table, filtered by `task_itinerary_id`.

## Considered options

- **A link per opgave (`task_itinerary_items`, removed earlier).** A tur works through lokationer, and simpel opgaver are notifikationer without a row of their own, so a link per opgave can't describe a tur.
- **A pure event log** (one row per event, with periods worked out using `LEAD()`). This is the most flexible, but every reader has to rebuild the periods from the events, and the relation view would have to change. We found no event that doesn't open or close a tilknytning.
- **A separate history table next to the current one.** This would store the same facts twice, and the two tables could drift apart.
- **The ending on the row without a tur** (for example `start_event = 'fjernet'` on that row, instead of `end_event` on the tilknytning). That row only says the lokation left the tur, not whether work was done first: in November 2026, 330 of the 1,037 tilknytninger followed by such a row ended besøgt. Besøgt, frigivet and flettet_ud also insert no such row, so the ending would be split across two rows, and every reader would have to look at the next row.

## Consequences

- Rows are written twice: once to open and once to close. A row that is closed is never opened again. Adding the lokation again creates a new row.
- Opgaver lukket, pejlinger and tilsyn are not stored on the tur. They are matched by lokation and time window (`timeofmeas`/`dato` between `created_at` and `ended_at`).
- Rows from before this change have no `ended_at`/`end_event`, or only a guessed value, so the history of old ture is partial. The app doesn't flag it.
- Known loose ends in the rows without a tur, left alone for now (November 2026):
  - They have `start_event = 'tilføjet'`, the column default, though they mean "on no tur". Nothing reads it.
  - Their `created_by` is the person who removed or moved the lokation. The 1,037 old removals have no `ended_by`, which could be filled in from it.
  - 71 of them have `done = true`, which the old code shouldn't produce. It's harmless, since they have no tur.
- Time registration can later put the time spent at each lokation on the row itself. A lokation can have udstyr on several projekter, so this may need one value per lokation × projekt instead. See WAT-976 (Tidsregistrering på ture) in Linear.
