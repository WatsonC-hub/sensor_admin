import {useStore} from 'zustand';
import {useShallow} from 'zustand/shallow';
import React from 'react';
import {MapFilterContext, MapFilterState} from '../MapFilterProvider';

export const useMapFilterStore = <T>(selector: (state: MapFilterState) => T) => {
  const store = React.useContext(MapFilterContext);
  if (!store) {
    throw new Error('Missing MapFilterContextProvider');
  }
  return useStore(store, useShallow(selector));
};
