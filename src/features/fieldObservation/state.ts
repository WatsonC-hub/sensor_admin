import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';

import {isBackgroundMapId} from '~/features/fieldObservation/backgroundMaps';

import type {BackgroundMapId} from '~/features/fieldObservation/backgroundMaps';

/** The newest luftfoto, which can also be downloaded for offline use. */
const DEFAULT_BACKGROUND_MAP: BackgroundMapId = 'luftfoto';

const storedBackgroundMapAtom = atomWithStorage<string>(
  'fieldObservation.backgroundMap',
  DEFAULT_BACKGROUND_MAP
);

/** The chosen background map; a stored map that no longer exists (e.g. 'osm') reads as the default. */
export const backgroundMapAtom = atom(
  (get) => {
    const stored = get(storedBackgroundMapAtom);
    return isBackgroundMapId(stored) ? stored : DEFAULT_BACKGROUND_MAP;
  },
  (_get, set, id: BackgroundMapId) => set(storedBackgroundMapAtom, id)
);

/** Ortofoto year; null means the newest. */
export const ortofotoYearAtom = atomWithStorage<number | null>(
  'fieldObservation.ortofotoYear',
  null
);

/** The projekt chosen in the top bar: filters the map and is the default for new feltobservationer. */
/** Ids ("schema.table") of the Explorer GIS layers turned on in /observation. */
export const activeGisLayersAtom = atomWithStorage<string[]>('fieldObservation.gisLayers', []);

/** Opacity (0–1) per GIS layer id; a missing id is fully opaque. */
export const gisLayerOpacityAtom = atomWithStorage<Record<string, number>>(
  'fieldObservation.gisLayerOpacity',
  {}
);

export const selectedProjectAtom = atomWithStorage<string | null>('fieldObservation.project', null);

/** Ids of projektlag the user has hidden. Projektlag are shown unless hidden. */
export const hiddenProjectLayersAtom = atomWithStorage<string[]>(
  'fieldObservation.hiddenProjectLayers',
  []
);

/**
 * Projektlag ids, top layer first, as the user ordered them on this device. It holds ids from
 * every projekt; a layer missing from it (e.g. just uploaded) is drawn above the ordered ones.
 */
export const projectLayerOrderAtom = atomWithStorage<string[]>(
  'fieldObservation.projectLayerOrder',
  []
);

/** Sorts projektlag by `order`, top layer first. Layers not in `order` keep their order on top. */
export const sortProjectLayers = <T extends {id: string}>(layers: T[], order: string[]) => {
  const rank = new Map(order.map((id, index) => [id, index]));
  return [...layers].sort((a, b) => (rank.get(a.id) ?? -1) - (rank.get(b.id) ?? -1));
};

/** Legend keys (types and their variants, see styles.ts) the user has hidden on the map. */
export const hiddenLegendAtom = atomWithStorage<string[]>('fieldObservation.hiddenLegend', []);

/**
 * The observationstype last used for a new feltobservation, per geometry type (Point,
 * LineString, Polygon). A new one starts with it, since fieldwork often records the same type
 * many times in a row.
 */
export const lastTypeIdAtom = atomWithStorage<Record<string, number>>(
  'fieldObservation.lastTypeIdByGeometry',
  {},
  undefined,
  {getOnInit: true}
);

/** What to put in a GeoPackage from Hent som GeoPackage. */
export type ExportChoice = {
  /** Observationstyper by schema_key. */
  types: string[];
  /** Projektlag ids. */
  projectLayers: string[];
  images: boolean;
};

/** The last Hent som GeoPackage choice per projekt, so the dialog opens with it. */
export const exportChoiceAtom = atomWithStorage<Record<string, ExportChoice>>(
  'fieldObservation.exportChoice',
  {}
);

/** Redigeringstilstand: clicking a feltobservation opens it in Rediger instead of Vis. */
export const editModeAtom = atomWithStorage<boolean>('fieldObservation.editMode', false);
