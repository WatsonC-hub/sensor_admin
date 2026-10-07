import React from 'react';
import {useStore} from 'zustand';
import {useShallow} from 'zustand/shallow';

import {MapFilterContext} from '../MapFilterProvider';

import type {MapFilterState} from '../MapFilterProvider';

export const useMapFilterStore = <T>(selector: (state: MapFilterState) => T) => {
  const store = React.useContext(MapFilterContext);
  if (!store) {
    throw new Error('Missing MapFilterContextProvider');
  }
  return useStore(store, useShallow(selector));
};
