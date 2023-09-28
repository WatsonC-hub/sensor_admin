import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';

export const captureDialogAtom = atom(false);

export const qaSelection = atom({});

export const stationTableAtom = atomWithStorage('StationTableState', {
  columnVisibility: {
    ts_id: false,
  },
});
