import {create} from 'zustand';
import {useQueryState, parseAsInteger, parseAsString} from 'nuqs';
import {useEffect} from 'react';
import {useShallow} from 'zustand/shallow';

// Zustand Store for UI state
interface DisplayState {
  ts_id: number | null;
  loc_id: number | null;
  boreholeno: string | null;
  intakeno: number | null;
  selectedTask: string | null;

  setTsId: (id: number | null) => void;
  setLocId: (id: number | null) => void;
  closeLocation: () => void;
  setBoreholeNo: (no: string | null) => void;
  setIntakeNo: (no: number | null) => void;
  setSelectedTask: (taskId: string | null) => void;
}

// Create Zustand store
export const displayStore = create<DisplayState>((set) => ({
  ts_id: null,
  loc_id: null,
  boreholeno: null,
  intakeno: null,
  selectedTask: null,

  setTsId: (ts_id) => set({ts_id}),
  setLocId: (loc_id) =>
    set(() => ({
      loc_id,
      ts_id: null, // Reset dependent states
      boreholeno: null,
      intakeno: null,
    })),
  closeLocation: () => set({loc_id: null}),
  setBoreholeNo: (boreholeno) =>
    set(() => ({
      boreholeno,
      intakeno: null,
      loc_id: null,
      ts_id: null,
    })),
  setIntakeNo: (intakeno) => set({intakeno}),
  setSelectedTask: (selectedTask) => set({selectedTask}),
}));

// Hook to sync Zustand store with URL
export const useSyncQueryState = () => {
  // Read from URL
  const [ts_id, setTsIdQuery] = useQueryState('ts_id', parseAsInteger);
  const [loc_id, setLocIdQuery] = useQueryState('loc_id', parseAsInteger);
  const [boreholeno, setBoreholeNoQuery] = useQueryState('boreholeno', parseAsString);
  const [intakeno, setIntakeNoQuery] = useQueryState('intakeno', parseAsInteger);

  // Zustand store
  const {setTsId, setLocId, setBoreholeNo, setIntakeNo} = useDisplayState((state) => ({
    setTsId: state.setTsId,
    setLocId: state.setLocId,
    setBoreholeNo: state.setBoreholeNo,
    setIntakeNo: state.setIntakeNo,
  }));

  // console.log('ts_id', ts_id);
  // Sync Zustand with URL params on mount
  useEffect(() => {
    if (loc_id) setLocId(loc_id);
    if (ts_id) setTsId(ts_id);
    if (boreholeno) setBoreholeNo(boreholeno);
    if (intakeno) setIntakeNo(intakeno);
  }, []);

  // Sync Zustand state to URL whenever it changes
  useEffect(() => {
    const unsubscribe = displayStore.subscribe((state) => {
      console.log('state', state);
      setTsIdQuery(state.ts_id);
      setLocIdQuery(state.loc_id);
      setBoreholeNoQuery(state.boreholeno);
      setIntakeNoQuery(state.intakeno);
    });

    return () => unsubscribe();
  }, [setTsIdQuery, setLocIdQuery, setBoreholeNoQuery, setIntakeNoQuery]);
};

export const useDisplayState = <T>(selector: (state: DisplayState) => T) => {
  return displayStore(useShallow(selector));
};

// Call this hook once in the main component (e.g., App.tsx)
export const useInitializeDisplayState = () => {
  useSyncQueryState();
};
