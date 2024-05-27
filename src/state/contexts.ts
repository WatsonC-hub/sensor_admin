import {createContext} from 'react';

type MetaData = {
  ts_id: number | undefined;
  loc_id: number | undefined;
};

export const MetadataContext = createContext<MetaData | undefined>(undefined);
