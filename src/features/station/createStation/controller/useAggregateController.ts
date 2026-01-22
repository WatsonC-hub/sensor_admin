import {useCallback, useMemo, useRef, useState} from 'react';
import {SliceState} from './types';
import {AggregateController} from './AggregateController';

// export function useAggregateController<T extends Record<string, any>>() {
//   type SliceKey = keyof T;

//   const [slices, setSlices] = useState<Partial<{[K in SliceKey]: SliceState<T[K]>}>>({});

//   console.log('AggregateController slices:', slices);

//   const registerSlice = useCallback(
//     <K extends SliceKey>(id: K, required: boolean, validate?: () => Promise<boolean>) => {
//       setSlices((prev) => ({
//         ...prev,
//         [id]: {required, valid: false, validate},
//       }));
//     },
//     []
//   );

//   const unregisterSlice = useCallback(<K extends SliceKey>(id: K) => {
//     setSlices((prev) => {
//       const next = {...prev};
//       delete next[id];
//       return next;
//     });
//   }, []);

//   const updateSlice = useCallback(<K extends SliceKey>(id: K, valid: boolean, value?: T[K]) => {
//     setSlices((prev) => ({
//       ...prev,
//       [id]: {
//         ...prev[id],
//         valid,
//         value,
//       },
//     }));
//   }, []);

//   const validateAllSlices = useCallback(async () => {
//     let isValid = true;
//     // console.log('Validating all slices in AggregateController', slices);
//     for (const key in slices) {
//       const slice = slices[key as SliceKey];
//       console.log(`Validating slice ${key}:`, slice);
//       if (slice?.validate) {
//         const sliceValid = await slice.validate();
//         console.log(`Slice ${key} validation result:`, sliceValid);
//         isValid = isValid && sliceValid;
//       }
//     }

//     return isValid;
//   }, [slices]);

//   const isValid = useMemo(() => {
//     return Object.values(slices).every((slice) =>
//       slice ? (slice.required ? slice.valid : !slice.value || slice.valid) : true
//     );
//   }, [slices]);

//   const getValues = useCallback(() => {
//     const values: T = {} as T;
//     for (const key in slices) {
//       const slice = slices[key as SliceKey];
//       if (slice?.value !== undefined) {
//         values[key as keyof T] = slice.value;
//       }
//     }
//     return values;
//   }, [slices]);

//   const out = useMemo(() => {
//     console.log('NEW AggregateController object:');
//     return {
//       slices,
//       registerSlice,
//       unregisterSlice,
//       updateSlice,
//       validateAllSlices,
//       isValid,
//       getValues,
//     };
//   }, [slices, registerSlice, unregisterSlice, updateSlice, validateAllSlices, isValid, getValues]);

//   return out;
// }

export function useAggregateController<T extends Record<string, any>>() {
  const ref = useRef<AggregateController<T> | null>(null);

  if (!ref.current) {
    ref.current = new AggregateController<T>();
  }

  return ref.current;
}
