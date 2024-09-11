import {createContext, useContext} from 'react';

// import {StationDetails} from '~/types';

type MetaData = {
  ts_id: number | undefined;
  loc_id: number | undefined;
  unit_uuid: string | null;
};

export const MetadataContext = createContext<MetaData | undefined>(undefined);

// export const stationDetailsContext = createContext<StationDetails | undefined>(undefined);

export const DrawerContext = createContext<'closed' | 'half' | 'full'>('closed');

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
