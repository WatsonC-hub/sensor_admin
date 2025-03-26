import {create} from 'zustand';
import {useShallow} from 'zustand/shallow';

type MapUtilityState = {
  selectedLocId: number | null;
  editParkingLayer: 'create' | number | null;
  editRouteLayer: 'create' | number | null;
  setSelectedLocId: (loc_id: number | null) => void;
  setEditParkingLayer: (editLayer: 'create' | number | null) => void;
  setEditRouteLayer: (editLayer: 'create' | number | null) => void;
};

export const mapUtilityStore = create<MapUtilityState>((set) => ({
  selectedLocId: null,
  setSelectedLocId: (loc_id: number | null) => set({selectedLocId: loc_id}),
  editParkingLayer: null,
  editRouteLayer: null,
  setEditParkingLayer: (editLayer: 'create' | number | null) => set({editParkingLayer: editLayer}),
  setEditRouteLayer: (editLayer: 'create' | number | null) => set({editRouteLayer: editLayer}),
}));

export const useMapUtilityStore = <T>(selector: (state: MapUtilityState) => T) => {
  return mapUtilityStore(useShallow(selector));
};
