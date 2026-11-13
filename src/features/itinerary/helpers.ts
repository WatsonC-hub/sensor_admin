import dayjs from 'dayjs';

import type {
  Afslutningsaarsag,
  MovedTo,
  Tilknytning,
  TilknytningSlut,
  TurForloebEvent,
} from './types';

export const isBesoegt = (link: Tilknytning) => link.end_event === 'besøgt';

/** One lokation on a tur, judged over all its tilknytninger to the tur. */
export type LocationOnTur = {
  loc_id: number;
  loc_name: string;
  /** The newest tilknytning. */
  latest: Tilknytning;
  /** The newest tilknytning that ended besøgt, if any. */
  visit: Tilknytning | null;
  /** Still on the tur, waiting to be visited (again). */
  open: boolean;
  /** Visited on this tur and not waiting for another visit. */
  besoegt: boolean;
};

const byName = (a: {loc_name: string}, b: {loc_name: string}) =>
  a.loc_name.localeCompare(b.loc_name, 'da', {sensitivity: 'base'});

/**
 * Each lokation that has been on the tur. A lokation can be on the same tur more than once.
 * It counts as besøgt if any of its tilknytninger ended besøgt, also when it was put on the
 * tur again later and then moved or removed without work; only an open tilknytning (it's
 * waiting for another visit) takes precedence. Open first, then besøgt, then the rest;
 * alphabetical within each group.
 */
export const locationsOnTur = (links: Tilknytning[]): LocationOnTur[] => {
  const byLoc = new Map<number, LocationOnTur>();
  for (const link of [...links].sort((a, b) => a.created_at.localeCompare(b.created_at))) {
    const current = byLoc.get(link.loc_id);
    const visit = isBesoegt(link) ? link : (current?.visit ?? null);
    byLoc.set(link.loc_id, {
      loc_id: link.loc_id,
      loc_name: link.loc_name,
      latest: link,
      visit,
      open: link.is_open,
      besoegt: !link.is_open && visit !== null,
    });
  }
  const rank = (location: LocationOnTur) => (location.open ? 0 : location.besoegt ? 1 : 2);
  return [...byLoc.values()].sort((a, b) => rank(a) - rank(b) || byName(a, b));
};

/** Lokationer to show on an active tur: open and besøgte ones. Fjernede are hidden. */
export const visibleOnActiveTur = (links: Tilknytning[]) =>
  locationsOnTur(links).filter((location) => location.open || location.besoegt);

export const tilknytningSlutLabel: Record<TilknytningSlut, string> = {
  besøgt: 'Besøgt',
  fjernet: 'Fjernet',
  frigivet: 'Frigivet',
  flettet_ud: 'Flyttet til anden tur',
};

/** "Flyttet til <tur>" for a fjernet tilknytning that was moved, else null. */
export const movedLabel = (moved: MovedTo) =>
  moved.moved_to_itinerary_id
    ? `Flyttet til ${moved.moved_to_itinerary_name ?? 'anden tur'}`
    : null;

export const afslutningsaarsagLabel: Record<Afslutningsaarsag, string> = {
  manuel: 'Afsluttet manuelt',
  automatisk: 'Afsluttet automatisk',
  flettet: 'Flettet ind i anden tur',
  ukendt: 'Ukendt årsag',
};

type WorkEvent = Extract<TurForloebEvent, {type: 'pejling' | 'tilsyn' | 'opgave_lukket'}>;

/** One row inside a visit: all tilsyn, all pejlinger, or one closed opgave. */
export type VisitItem = {at: string; text: string};

/** One line in the Turforløb. */
export type ForloebLine =
  | {
      kind: 'visit';
      at: string;
      loc_id: number;
      loc_name: string;
      /** The projekter the work was for, in order. Usually one. */
      projectnos: string[];
      items: VisitItem[];
    }
  | {kind: 'not_visited'; at: string; loc_id: number; loc_name: string; summary: string};

export type ForloebDay = {day: string; lines: ForloebLine[]};

/** What was done for one projekt on the tur. projectno is null when none could be found. */
export type ForloebProject = {
  projectno: string | null;
  project_title: string | null;
  customer_name: string | null;
  locations: number;
  pejlinger: number;
  tilsyn: number;
  opgaver: number;
};

export type Forloeb = {
  projects: ForloebProject[];
  days: ForloebDay[];
  completedAt: string | null;
};

const isWork = (event: TurForloebEvent): event is WorkEvent =>
  event.type === 'pejling' || event.type === 'tilsyn' || event.type === 'opgave_lukket';

const capitalize = (text: string) => text.charAt(0).toUpperCase() + text.slice(1);

/**
 * The rows of one visit, in the order they happened: one row for the tilsyn ("Tilsyn,
 * batteriskift"), one row for all pejlinger ("5 pejlinger"), and one row per closed opgave
 * ("Sender ikke færdiggjort"). Each row shows the time of its first registration.
 */
const visitItems = (events: WorkEvent[]): VisitItem[] => {
  const items: VisitItem[] = [];

  const tilsyn = events.filter((e) => e.type === 'tilsyn');
  if (tilsyn.length > 0) {
    const details = tilsyn.map((e) => e.detail ?? '');
    const parts = [];
    if (details.some((d) => d.includes('tilsyn') || d === '')) parts.push('tilsyn');
    if (details.some((d) => d.includes('batteriskift'))) parts.push('batteriskift');
    items.push({at: tilsyn[0].at, text: capitalize(parts.join(', '))});
  }

  const pejlinger = events.filter((e) => e.type === 'pejling');
  if (pejlinger.length > 0) {
    items.push({
      at: pejlinger[0].at,
      text: pejlinger.length === 1 ? 'Pejling' : `${pejlinger.length} pejlinger`,
    });
  }

  for (const event of events) {
    if (event.type !== 'opgave_lukket') continue;
    // detail is "<opgave name>: <status name>"
    const [name, status] = event.detail.split(': ');
    items.push({
      at: event.at,
      text: status ? `${name.trim()} ${status.toLowerCase()}` : name.trim(),
    });
  }

  return items.sort((a, b) => dayjs(a.at).valueOf() - dayjs(b.at).valueOf());
};

/** Per projekt: how many lokationer had work, and how much of each kind. */
const summarizeProjects = (work: WorkEvent[]): ForloebProject[] => {
  const projects = new Map<string | null, ForloebProject>();
  const locIds = new Map<string | null, Set<number | null>>();
  // work is oldest first, so projekter come out in the order they were first worked on.
  for (const event of work) {
    let project = projects.get(event.projectno);
    if (!project) {
      project = {
        projectno: event.projectno,
        project_title: event.project_title,
        customer_name: event.customer_name,
        locations: 0,
        pejlinger: 0,
        tilsyn: 0,
        opgaver: 0,
      };
      projects.set(event.projectno, project);
      locIds.set(event.projectno, new Set());
    }
    const seen = locIds.get(event.projectno)!;
    seen.add(event.loc_id);
    project.locations = seen.size;
    if (event.type === 'pejling') project.pejlinger++;
    else if (event.type === 'tilsyn') project.tilsyn++;
    else project.opgaver++;
  }
  return [...projects.values()];
};

/**
 * Turns the raw Turforløb into a timeline, oldest first: by day, then one entry per visit.
 * A visit is the work registered at the same lokation in a row, with nothing at another
 * lokation in between; it lists the projekter the work was for. Planning events (lokationer
 * added or moved) are left out; they're in the Lokationer tab. A lokation that left the
 * tur without any work gets a line saying so. Next to the timeline, a summary per projekt.
 */
export const buildForloeb = (events: TurForloebEvent[]): Forloeb => {
  const work = events.filter(isWork);
  const visitedLocIds = new Set(work.map((e) => e.loc_id));
  // The last tilknytning event per lokation. A lokation that was removed and added again
  // is still on the tur, so only its final removal counts.
  const lastLinkEvent = new Map<number, TurForloebEvent>();
  for (const event of events) {
    if (
      (event.type === 'tilknytning_start' || event.type === 'tilknytning_slut') &&
      event.loc_id !== null
    )
      lastLinkEvent.set(event.loc_id, event);
  }

  const days: ForloebDay[] = [];
  let completedAt: string | null = null;
  let currentDay = null as ForloebDay | null;
  let visit = null as {loc_id: number; loc_name: string; at: string; events: WorkEvent[]} | null;

  const closeVisit = () => {
    if (visit && currentDay) {
      const projectnos = [
        ...new Set(visit.events.map((e) => e.projectno).filter((no) => no !== null)),
      ];
      currentDay.lines.push({
        kind: 'visit',
        at: visit.at,
        loc_id: visit.loc_id,
        loc_name: visit.loc_name,
        projectnos,
        items: visitItems(visit.events),
      });
    }
    visit = null;
  };

  for (const event of events) {
    if (event.type === 'tur_afsluttet') {
      completedAt = event.at;
      continue;
    }

    const day = dayjs(event.at).format('dddd D. MMMM YYYY');
    if (currentDay?.day !== day) {
      closeVisit();
      currentDay = {day, lines: []};
      days.push(currentDay);
    }

    if (isWork(event) && event.loc_id !== null) {
      if (visit?.loc_id !== event.loc_id) {
        closeVisit();
        visit = {loc_id: event.loc_id, loc_name: event.loc_name ?? '', at: event.at, events: []};
      }
      visit.events.push(event);
      continue;
    }

    if (
      event.type === 'tilknytning_slut' &&
      event.loc_id !== null &&
      !visitedLocIds.has(event.loc_id) &&
      lastLinkEvent.get(event.loc_id) === event &&
      (event.detail === 'fjernet' || event.detail === 'frigivet')
    ) {
      closeVisit();
      currentDay.lines.push({
        kind: 'not_visited',
        at: event.at,
        loc_id: event.loc_id,
        loc_name: event.loc_name ?? '',
        summary:
          event.detail === 'frigivet'
            ? 'Frigivet, da turen blev afsluttet'
            : (movedLabel(event) ?? 'Fjernet fra turen'),
      });
    }
    // Everything else (lokationer added, moved, besøgt) is planning and left out.
  }
  closeVisit();

  return {
    projects: summarizeProjects(work),
    days: days.filter((day) => day.lines.length > 0),
    completedAt,
  };
};
