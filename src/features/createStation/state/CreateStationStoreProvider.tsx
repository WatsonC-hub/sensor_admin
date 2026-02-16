import React, {useState} from 'react';

import {createStore} from 'zustand';
import {CreateStationFormState} from '../types';
import {devtools} from 'zustand/middleware';

function setByPath<T extends object, P extends Path<T>>(
  obj: T,
  path: P,
  value: Partial<PathValue<T, P>>
): T {
  const tokens = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  function update(current: any, index: number): any {
    const key = tokens[index];
    const isLast = index === tokens.length - 1;

    const clone = Array.isArray(current) ? [...current] : {...current};

    if (isLast) {
      clone[key] = value;
      return clone;
    }

    const next = current?.[key] ?? (Number.isInteger(+tokens[index + 1]) ? [] : {});

    clone[key] = update(next, index + 1);
    return clone;
  }

  return update(obj, 0);
}

function getByPath<T extends object, P extends Path<T>>(
  obj: T,
  path: P
): PathValue<T, P> | undefined {
  const tokens = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  function get(current: any, index: number): any {
    const key = tokens[index];
    if (current == null) {
      return undefined;
    }
    if (index === tokens.length - 1) {
      return current[key];
    }
    return get(current[key], index + 1);
  }

  return get(obj, 0);
}

function deleteByPath<T extends object, P extends Path<T>>(obj: T, path: P): T {
  const tokens = path
    .replace(/\[(\d+)\]/g, '.$1')
    .split('.')
    .filter(Boolean);

  function remove(current: any, index: number): any {
    const key = tokens[index];
    const isLast = index === tokens.length - 1;

    const clone = Array.isArray(current) ? [...current] : {...current};

    if (isLast) {
      if (Array.isArray(clone)) {
        clone.splice(Number(key), 1);
      } else {
        delete clone[key];
      }
      return clone;
    }

    if (current?.[key] == null) {
      return clone;
    }

    clone[key] = remove(current[key], index + 1);
    return clone;
  }

  return remove(obj, 0);
}

type Submitters = Record<string, () => Promise<boolean>>;

type NonUndefined<T> = T extends undefined ? never : T;

type Primitive = string | number | boolean | bigint | symbol | null | undefined;

type Path<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & (string | number)]: NonUndefined<T[K]> extends Primitive
        ? `${K}`
        : NonUndefined<T[K]> extends Array<infer U>
          ? `${K}` | `${K}.${number}` | `${K}.${number}.${Path<U>}`
          : `${K}` | `${K}.${Path<NonUndefined<T[K]>>}`;
    }[keyof T & (string | number)];

type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
  ? K extends keyof T
    ? NonUndefined<T[K]> extends Array<infer U>
      ? Rest extends `${number}.${infer R}`
        ? PathValue<U, R & Path<U>>
        : U
      : PathValue<NonUndefined<T[K]>, Rest & Path<NonUndefined<T[K]>>>
    : never
  : P extends keyof T
    ? NonUndefined<T[P]>
    : never;

export type CreateStationStoreState = {
  formState: Partial<CreateStationFormState>;
  isFormError: boolean;
  submitters: Submitters;
  setState: <P extends Path<Partial<CreateStationFormState>>>(
    path: P,
    data: Partial<PathValue<Partial<CreateStationFormState>, P>>
  ) => void;
  setIsFormError: (val: boolean) => void;
  deleteState: <P extends Path<Partial<CreateStationFormState>>>(path: P) => void;
  resetState: <P extends Path<Partial<CreateStationFormState>>>(path: P) => void;
  registerSubmitter: (id: string, callback: () => Promise<boolean>) => void;
  removeSubmitter: (id: string) => void;
  runSubmitters: () => boolean;
  clearSubmitters: () => void;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// const defaultState: DeepPartial<CreateStationFormState> = {
//   location: {
//     contacts: [],
//     location_access: [],
//   },
// };

const createStationStore = (defaultValues?: DeepPartial<CreateStationFormState>) =>
  createStore<CreateStationStoreState>()(
    devtools((set) => ({
      formState: defaultValues,
      submitters: {},
      isFormError: false,
      setState: (path, data) =>
        set((state) => ({
          formState: setByPath(state.formState, path, data),
        })),
      resetState: (path) =>
        set((state) => {
          const value = getByPath(defaultValues ?? {}, path) ?? {};

          return {
            formState: setByPath(state.formState, path, value),
          };
        }),
      setIsFormError: (value) => set(() => ({isFormError: value})),
      deleteState: (path) =>
        set((state) => ({
          formState: deleteByPath(state.formState, path),
        })),

      registerSubmitter: (id, callback) =>
        set((state) => ({
          submitters: {...state.submitters, [id]: callback},
        })),

      removeSubmitter: (id) =>
        set((state) => {
          const submitters = {
            ...state.submitters,
          };
          delete submitters[id];

          return {submitters: submitters};
        }),
      clearSubmitters: () => set(() => ({submitters: {}})),
      runValidators: () => true,
    }))
  );

export const CreateStationStoreContext = React.createContext<ReturnType<
  typeof createStationStore
> | null>(null);

interface CreateStationStoreProviderProps {
  children: React.ReactNode;
  defaultValues?: DeepPartial<CreateStationFormState>;
}

const CreateStationStoreProvider = ({children, defaultValues}: CreateStationStoreProviderProps) => {
  const [store] = useState(() => createStationStore(defaultValues));

  return (
    <CreateStationStoreContext.Provider value={store}>
      {children}
    </CreateStationStoreContext.Provider>
  );
};

export default CreateStationStoreProvider;
