import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {useShallow} from 'zustand/shallow';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';

type MapFilterState = {
  search: string;
  setSearch: (search: string) => void;
  filters: Filter;
  setFilters: (filters: Filter) => void;

  locIds: number[];
  setLocIds: (locIds: number[]) => void;

  resetFilter: () => void;
};

const mapFilterStore = create<MapFilterState>()(
  persist(
    devtools((set) => ({
      search: '',
      setSearch: (search) => set({search}),
      filters: defaultMapFilter,
      setFilters: (filters) => set({filters}),
      locIds: [],
      setLocIds: (locIds) => set({locIds}),
      resetFilter: () =>
        set({
          filters: defaultMapFilter,
        }),
    })),
    {
      name: 'calypso-map-filter',
      storage: createJSONStorage(() => localStorage),
    }
  )
);

export const useMapFilterStore = <T>(selector: (state: MapFilterState) => T) => {
  return mapFilterStore(useShallow(selector));
};
