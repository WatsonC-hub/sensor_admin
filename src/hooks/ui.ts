import {create} from 'zustand';
import {useShallow} from 'zustand/shallow';

// Zustand Store for UI state
interface DisplayState {
  ts_id: number | null;
  loc_id: number | null;
  boreholeno: string | null;
  intakeno: number | null;
  selectedTask: string | null;
  loc_list: boolean;
  trip_list: boolean;

  setTsId: (id: number | null) => void;
  setLocId: (id: number | null) => void;
  closeLocation: () => void;
  setBoreholeNo: (no: string | null) => void;
  setIntakeNo: (no: number | null) => void;
  setSelectedTask: (taskId: string | null) => void;
  setLocList: (loc_list: boolean) => void;
  setTripList: (trip_list: boolean) => void;
}

// Create Zustand store
export const displayStore = create<DisplayState>((set) => ({
  ts_id: null,
  loc_id: null,
  boreholeno: null,
  intakeno: null,
  selectedTask: null,
  loc_list: false,
  trip_list: false,

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
  setLocList: (loc_list) => set({loc_list}),
  setTripList: (trip_list) => set({trip_list}),
}));

export const useDisplayState = <T>(selector: (state: DisplayState) => T) => {
  return displayStore(useShallow(selector));
};
