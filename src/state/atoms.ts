import {atom} from 'jotai';
import {atomWithStorage, atomFamily} from 'jotai/utils';
import type {MRT_TableState, MRT_RowData} from 'material-react-table';

export const captureDialogAtom = atom(false);

export const qaSelection = atom({});

export const statefullTableAtomFamily = atomFamily(
  (key: string) =>
    atomWithStorage<Partial<MRT_TableState<MRT_RowData>>>(
      key,
      {
        pagination: {
          pageSize: 10,
          pageIndex: 0,
        },
        density: 'comfortable',
      },
      undefined,
      {
        getOnInit: true,
      }
    ),
  (a, b) => {
    return a == b;
  }
);

// export const stationTableAtom = atomWithStorage('StationTableState', {
//   columnVisibility: {
//     ts_id: false,
//     'mrt-row-expand': true,
//   },
//   pagination: {
//     page: 0,
//     pageSize: 10,
//     pageIndex: 0,
//   },
//   density: 'compact',
// });

export const boreholeTableAtom = atomWithStorage('BoreholeTableState', {
  columnVisibility: {
    num_controls_in_a_year: false,
    'mrt-row-expand': false,
  },
  pagination: {
    page: 0,
    pageSize: 10,
    pageIndex: 0,
  },
  density: 'compact',
});

export const dataToShowAtom = atom({
  QA: true,
  Kontrolmålinger: true,
  Nedbør: false,
  'Korrigerede spring': false,
  'Valide værdier': false,
  'Fjernet data': false,
});
