import {atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';

export const captureDialogAtom = atom(false);

export const qaSelection = atom({});

export const stationTableAtom = atomWithStorage('StationTableState', {
  columnVisibility: {
    ts_id: false,
    'mrt-row-expand': false,
  },
  pagination: {
    page: 0,
    pageSize: 10,
    pageIndex: 0,
  },
});
