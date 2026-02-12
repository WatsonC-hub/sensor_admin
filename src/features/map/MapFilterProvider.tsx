import {createStore} from 'zustand';
import {createJSONStorage, devtools, persist} from 'zustand/middleware';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import {merge} from 'lodash';
import {useUser} from '../auth/useUser';
import React, {useState} from 'react';

export type MapFilterState = {
  search: string;
  setSearch: (search: string) => void;
  filters: Filter;
  setFilters: (filters: Filter) => void;

  locIds: (number | string)[];
  setLocIds: (locIds: (number | string)[]) => void;
};

const createMapFilterStore = (superUser: boolean) => {
  return createStore<MapFilterState>()(
    persist(
      devtools((set) => ({
        search: '',
        setSearch: (search) => set({search}),
        filters: {...defaultMapFilter(superUser)},
        setFilters: (filters) => set({filters}),
        locIds: [],
        setLocIds: (locIds) => set({locIds}),
      })),
      {
        name: 'calypso-map-filter',
        storage: createJSONStorage(() => localStorage),
        version: 4,
        merge: (persistedState, currentState) => {
          const merged = merge(
            {filters: {...defaultMapFilter(superUser)}},
            currentState,
            persistedState
          );
          return merged;
        },
      }
    )
  );
};

export const MapFilterContext = React.createContext<ReturnType<typeof createMapFilterStore> | null>(
  null
);

interface MapFilterContextProviderProps {
  children: React.ReactNode;
}

export const MapFilterContextProvider = ({children}: MapFilterContextProviderProps) => {
  const {superUser} = useUser();
  const [store] = useState(() => createMapFilterStore(superUser));

  return <MapFilterContext.Provider value={store}>{children}</MapFilterContext.Provider>;
};
