import {create} from 'zustand';
import {useShallow} from 'zustand/shallow';
import {CreateStationFormState, CreateStationPayload} from '../controller/types';
import {devtools} from 'zustand/middleware';

function setByPath<T extends object, P extends Path<T>>(
  obj: T,
  path: P,
  value: PathValue<T, P>
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

export type Path<T> = T extends Primitive
  ? never
  : {
      [K in keyof T & (string | number)]: NonUndefined<T[K]> extends Primitive
        ? `${K}`
        : NonUndefined<T[K]> extends Array<infer U>
          ? `${K}` | `${K}.${number}` | `${K}.${number}.${Path<U>}`
          : `${K}` | `${K}.${Path<NonUndefined<T[K]>>}`;
    }[keyof T & (string | number)];

export type PathValue<T, P extends Path<T>> = P extends `${infer K}.${infer Rest}`
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

type CreateStationState = {
  formState: Partial<CreateStationFormState>;
  isFormError: boolean;
  submitters: Submitters;
  setState: <P extends Path<Partial<CreateStationFormState>>>(
    path: P,
    data: PathValue<Partial<CreateStationFormState>, P>
  ) => void;
  setIsFormError: (val: boolean) => void;
  deleteState: <P extends Path<Partial<CreateStationFormState>>>(path: P) => void;
  registerSubmitter: (id: string, callback: () => Promise<boolean>) => void;
  removeSubmitter: (id: string) => void;
  runSubmitters: () => boolean;
  clearSubmitters: () => void;
};

export const createStationStore = create<CreateStationState>()(
  devtools((set) => ({
    formState: {},
    submitters: {},
    isFormError: false,
    setState: (path, data) =>
      set((state) => ({
        formState: setByPath(state.formState, path, data),
      })),
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
        const {[id]: _, ...rest} = state.submitters;
        return {submitters: rest};
      }),
    clearSubmitters: () => set(() => ({submitters: {}})),
    runValidators: () => true,
  }))
);

export const useCreateStationStore = <T>(selector: (state: CreateStationState) => T) => {
  return createStationStore(useShallow(selector));
};
