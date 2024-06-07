import {atom, Atom} from 'jotai';
import {atomWithStorage} from 'jotai/utils';
import type {MRT_TableState, MRT_RowData} from 'material-react-table';

export const captureDialogAtom = atom(false);

export const qaSelection = atom({});

const atoms: Record<string, Atom<unknown>> = {};

export const getStatefulTableAtom = <TData extends MRT_RowData>(
  key: string
): Atom<Partial<MRT_TableState<TData>>> => {
  if (key in Object.keys(atoms)) {
    return atoms[key];
  }

  return atomWithStorage(key, {
    columnVisibility: {
      ts_id: false,
      'mrt-row-expand': true,
    },
    pagination: {
      page: 0,
      pageSize: 10,
      pageIndex: 0,
    },
    density: 'compact',
  });
};

export const stationTableAtom = atomWithStorage('StationTableState', {
  columnVisibility: {
    ts_id: false,
    'mrt-row-expand': true,
  },
  pagination: {
    page: 0,
    pageSize: 10,
    pageIndex: 0,
  },
  density: 'compact',
});

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
