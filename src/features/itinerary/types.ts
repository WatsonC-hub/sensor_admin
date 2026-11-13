/** How a tilknytning started: added by hand, or moved in when two ture were merged. */
export type TilknytningStart = 'tilføjet' | 'flettet_ind';

/** How a tilknytning ended. `null` while the lokation is still on the tur. */
export type TilknytningSlut = 'besøgt' | 'fjernet' | 'frigivet' | 'flettet_ud';

/** Why a tur was afsluttet. `ukendt` for ture afsluttet before Turhistorik existed. */
export type Afslutningsaarsag = 'manuel' | 'automatisk' | 'flettet' | 'ukendt';

type TaskitineraryBase = {
  id: string;
  due_date?: string | null;
  assigned_to?: string | null;
  completed?: boolean;
  created_by: string;
  created_at: string;
  name: string;
  comment: string | null;
};

/** A tur as returned by the API, with the fields the backend derives from its tilknytninger. */
export type Taskitinerary = TaskitineraryBase & {
  completed_at?: string | null;
  completed_by?: string | null;
  completion_reason?: Afslutningsaarsag | null;
  /** Lokationer currently on the tur or besøgt. */
  link_count?: number;
  visited_count?: number;
};

/** One period a lokation is on a tur. */
export type Tilknytning = {
  id: string;
  task_itinerary_id: string;
  loc_id: number;
  loc_name: string;
  start_event: TilknytningStart;
  created_at: string;
  created_by: string | null;
  created_by_name: string | null;
  /** True only when the last opgave in Feltarbejde was finished (meaning from before
   * Turhistorik). Use is_open and end_event, not done, to tell open from ended. */
  done: boolean;
  /** Still on the tur: the lokation's newest row, no end_event. Worked out by the backend. */
  is_open: boolean;
  end_event: TilknytningSlut | null;
  ended_at: string | null;
  ended_by: string | null;
} & MovedTo;

/**
 * Set when a fjernet tilknytning was flyttet: the lokation was put on another tur right
 * after. Worked out by the backend, not stored. The name is null when the other tur
 * belongs to another organisation.
 */
export type MovedTo = {
  moved_to_itinerary_id: string | null;
  moved_to_itinerary_name: string | null;
};

type TurForloebEventBase = {
  at: string;
  by_id: string | null;
  by_name: string | null;
  loc_id: number | null;
  loc_name: string | null;
  ts_id: number | null;
  ref_id: string | null;
  /** From the udstyr mounted at that time, else the lokation's initialt projekt. */
  projectno: string | null;
  project_title: string | null;
  customer_name: string | null;
} & MovedTo;

/** One entry in the Turforløb. `detail` depends on the type. */
export type TurForloebEvent = TurForloebEventBase &
  (
    | {type: 'tilknytning_start'; detail: TilknytningStart}
    | {type: 'tilknytning_slut'; detail: TilknytningSlut}
    /** detail: "<opgave name>: <status name>" */
    | {type: 'opgave_lukket'; detail: string}
    | {type: 'pejling'; detail: null}
    /** detail: "batteriskift, tilsyn" */
    | {type: 'tilsyn'; detail: string}
    | {type: 'tur_afsluttet'; detail: null}
  );

export type ItineraryHistoryFilters = {
  assigned_to: string | null;
  search: string;
};

export type CompleteItineraryResult = {
  released_tasks: number;
  released_locations: number;
};

export type PostTaskitinerary = Omit<
  TaskitineraryBase,
  'id' | 'due_date' | 'created_at' | 'created_by'
> & {
  loc_ids: number[];
  due_date?: string | null;
};

export type PatchTaskitinerary = {
  path: string;
  data: Partial<Omit<TaskitineraryBase, 'id' | 'created_at' | 'created_by'>>;
};

export type DeleteTaskFromItinerary = {
  path: string;
};

export type completeItinerary = {
  path: string;
};

export type AddLocationToItinerary = {
  path: string;
  data: {loc_id: Array<number>};
};

export type MergeItinerary = {
  path: string;
  data: {target_itinerary_id: string};
};
