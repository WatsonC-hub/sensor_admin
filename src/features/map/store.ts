import {create} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {useShallow} from 'zustand/shallow';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import {merge} from 'lodash';

type MapFilterState = {
  search: string;
  setSearch: (search: string) => void;
  filters: Filter;
  setFilters: (filters: Filter) => void;

  locIds: (number | string)[];
  setLocIds: (locIds: (number | string)[]) => void;

  resetFilter: () => void;
};

const mapFilterStore = create<MapFilterState>()(
  persist(
    devtools((set) => ({
      search: '',
      setSearch: (search) => set({search}),
      filters: {...defaultMapFilter},
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
      merge: (persistedState, currentState) => {
        const merged = merge({filters: defaultMapFilter}, currentState, persistedState);
        return merged;
      },
    }
  )
);

export const useMapFilterStore = <T>(selector: (state: MapFilterState) => T) => {
  return mapFilterStore(useShallow(selector));
};
