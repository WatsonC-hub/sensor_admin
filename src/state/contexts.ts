import {createContext, useContext} from 'react';

// import {StationDetails} from '~/types';

type MetaData = {
  ts_id: number | undefined;
  loc_id: number | undefined;
  loc_name: string | undefined;
  tstype_name: string | undefined;
  unit: string | undefined;
  ts_name: string | undefined;
  unit_uuid: string | null;
  tstype_id: number | undefined;
};

export const MetadataContext = createContext<MetaData | undefined>(undefined);

// export const stationDetailsContext = createContext<StationDetails | undefined>(undefined);

export const DrawerContext = createContext<'closed' | 'half' | 'full'>('closed');

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};
