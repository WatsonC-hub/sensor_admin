import {atom} from 'jotai';
import {atomWithStorage, atomFamily} from 'jotai/utils';
import type {SyncStorage} from 'jotai/vanilla/utils/atomWithStorage';
import {merge} from 'lodash';
import type {MRT_TableState, MRT_RowData} from 'material-react-table';
import {PlotDatum} from 'plotly.js';
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

function createPartialTimedStorage<T>(
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
      if (parsedValue?.timestamp && Date.now() - parsedValue.timestamp < timeout_ms) {
        const newValue = {...value};
        for (const partialKey of partialKeys) {
          newValue[partialKey] = initialValue[partialKey];
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

const atomWithPartialTimedStorage = <T>(
  key: string,
  initialValue: T,
  timeout_ms: number,
  partialKeys: Array<keyof T>
) => atomWithStorage(key, initialValue, createPartialTimedStorage(timeout_ms, partialKeys));

export const atomWithTimedStorage = <T>(key: string, initialValue: T, timeout_ms: number) =>
  atomWithStorage(key, initialValue, createTimedStorage(timeout_ms), {
    getOnInit: true,
  });

export const captureDialogAtom = atom(false);

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
      },
      1000 * 60 * 60,
      ['pagination']
    ),
  (a, b) => {
    return a == b;
  }
);

export const dataToShowAtom = atom<Partial<DataToShow>>({});

export const drawerOpenAtom = atom<boolean>(false);
export const initiateSelectAtom = atom<boolean>(false);
export const initiateConfirmTimeseriesAtom = atom<boolean>(false);
export const levelCorrectionAtom = atom<boolean>(false);
export const boreholeSearchAtom = atom<string>('');
export const boreholeIsPumpAtom = atom<boolean>(false);
