import {atomWithStorage} from 'jotai/utils';

import type {BackgroundMapId} from '~/features/fieldObservation/backgroundMaps';

export const backgroundMapAtom = atomWithStorage<BackgroundMapId>(
  'fieldObservation.backgroundMap',
  'field'
);

/** Ortofoto year; null means the newest. */
export const ortofotoYearAtom = atomWithStorage<number | null>(
  'fieldObservation.ortofotoYear',
  null
);

/** The projekt chosen in the top bar: filters the map and is the default for new feltobservationer. */
/** Ids ("schema.table") of the Explorer GIS layers turned on in /observation. */
export const activeGisLayersAtom = atomWithStorage<string[]>('fieldObservation.gisLayers', []);

export const selectedProjectAtom = atomWithStorage<string | null>('fieldObservation.project', null);

/** Ids of projektlag the user has hidden. Projektlag are shown unless hidden. */
export const hiddenProjectLayersAtom = atomWithStorage<string[]>(
  'fieldObservation.hiddenProjectLayers',
  []
);

/** Legend keys (types and their variants, see styles.ts) the user has hidden on the map. */
export const hiddenLegendAtom = atomWithStorage<string[]>('fieldObservation.hiddenLegend', []);

/** Redigeringstilstand: clicking a feltobservation opens it in Rediger instead of Vis. */
export const editModeAtom = atomWithStorage<boolean>('fieldObservation.editMode', false);
