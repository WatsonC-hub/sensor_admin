import React from 'react';
import {useStore} from 'zustand';
import {useShallow} from 'zustand/shallow';

import {CreateStationStoreContext} from './CreateStationStoreProvider';

import type {CreateStationStoreState} from './CreateStationStoreProvider';

export const useCreateStationStore = <T>(selector: (state: CreateStationStoreState) => T) => {
  const store = React.useContext(CreateStationStoreContext);
  if (!store) {
    throw new Error('Missing CreateStationStoreProvider');
  }
  return useStore(store, useShallow(selector));
};
