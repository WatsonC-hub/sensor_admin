import {atom} from 'jotai';
import {atomWithStorage, atomFamily} from 'jotai/utils';
import type {SyncStorage} from 'jotai/vanilla/utils/atomWithStorage';
import {merge} from 'lodash';
import type {MRT_TableState, MRT_RowData} from 'material-react-table';
import {PlotDatum} from 'plotly.js';
import {TaskUser} from '~/features/tasks/types';
import {DataToShow} from '~/types';

function createTimedStorage<T>(timeout_ms: number): SyncStorage<T> {
  return {
    getItem(key, initialValue) {
      const storedValue = localStorage.getItem(key);
      let parsedValue;
      try {
        parsedValue = JSON.parse(storedValue ?? '');
      } catch {
        return initialValue;
      }
      if (parsedValue?.timestamp && Date.now() - parsedValue.timestamp > timeout_ms) {
        return initialValue;
      }
      return parsedValue?.value ?? initialValue;
    },
    setItem(key, value) {
      const data = {
        value,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(data));
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
    subscribe(key, callback, initialValue) {
      const eventCallback = (e: StorageEvent) => {
        if (e.storageArea === localStorage && e.key === key) {
          let newValue;
          try {
            newValue = JSON.parse(e.newValue ?? '');
          } catch {
            newValue = initialValue;
          }
          callback(newValue);
        }
      };

      window.addEventListener('storage', eventCallback);

      return () => {
        window.removeEventListener('storage', eventCallback);
      };
    },
  };
}

function createPartialTimedStorage<T extends object>(
  timeout_ms: number,
  partialKeys: Array<keyof T>
): SyncStorage<T> {
  return {
    getItem(key, initialValue) {
      const storedValue = localStorage.getItem(key);
      let parsedValue;
      try {
        parsedValue = JSON.parse(storedValue ?? '');
      } catch {
        return initialValue;
      }

      const value = merge({}, initialValue, parsedValue?.value ?? {});

      if (parsedValue?.timestamp && Date.now() - parsedValue.timestamp > timeout_ms) {
        const newValue = {...value};
        for (const partialKey of partialKeys) {
          if (Object.keys(initialValue).includes(partialKey as string)) {
            newValue[partialKey] = initialValue[partialKey];
          } else if (Object.keys(newValue).includes(partialKey as string)) {
            delete newValue[partialKey];
          }
        }
        return newValue;
      }
      return value;
    },
    setItem(key, value) {
      const data = {
        value,
        timestamp: Date.now(),
      };

      localStorage.setItem(key, JSON.stringify(data));
    },
    removeItem(key) {
      localStorage.removeItem(key);
    },
    subscribe(key, callback, initialValue) {
      const eventCallback = (e: StorageEvent) => {
        if (e.storageArea === localStorage && e.key === key) {
          let newValue;
          try {
            newValue = JSON.parse(e.newValue ?? '');
          } catch {
            newValue = initialValue;
          }
          callback(newValue);
        }
      };

      window.addEventListener('storage', eventCallback);

      return () => {
        window.removeEventListener('storage', eventCallback);
      };
    },
  };
}

const atomWithPartialTimedStorage = <T extends object>(
  key: string,
  initialValue: T,
  timeout_ms: number,
  partialKeys: Array<keyof T>
) =>
  atomWithStorage(key, initialValue, createPartialTimedStorage(timeout_ms, partialKeys), {
    getOnInit: true,
  });

export const atomWithTimedStorage = <T>(key: string, initialValue: T, timeout_ms: number) =>
  atomWithStorage(key, initialValue, createTimedStorage(timeout_ms), {
    getOnInit: true,
  });

export const qaSelection = atom<{
  range?: {x: Array<string>; y: Array<number>};
  points?: PlotDatum[];
  selections?: Array<{y0: number; y1: number}>;
}>({});

export const statefullTableAtomFamily = atomFamily(
  (key: string) =>
    atomWithPartialTimedStorage<Partial<MRT_TableState<MRT_RowData>>>(
      key,
      {
        pagination: {
          pageSize: 10,
          pageIndex: 0,
        },
        density: 'comfortable',
        columnVisibility: {
          'mrt-row-pin': false,
        },
      },
      1000 * 60 * 60,
      ['expanded', 'rowSelection', 'grouping', 'isFullScreen', 'pagination']
    ),
  (a, b) => {
    return a == b;
  }
);

export const dataToShowAtom = atom<Partial<DataToShow>>({});

export const fullScreenAtom = atom(false);

export const assignedToAtom = atomWithStorage<TaskUser | null>('assigned_to', null);

export const drawerOpenAtom = atom<boolean>(false);
export const initiateSelectAtom = atom<boolean>(false);
export const initiateConfirmTimeseriesAtom = atom<boolean>(false);
export const levelCorrectionAtom = atom<boolean>(false);
export const boreholeSearchAtom = atom<string>('');
export const boreholeIsPumpAtom = atom<boolean>(false);
export const usedWidthAtom = atom<number>(0);
export const usedHeightAtom = atom<number>(0);
