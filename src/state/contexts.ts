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

export type AppContextType = {
  loc_id?: number;
  ts_id?: number;
  boreholeno?: string;
  intakeno?: number;
};

export const AppContext = createContext<AppContextType | null>(null);

// Utility type to make required keys non-optional while keeping optional ones unchanged
type EnforceRequired<T, K extends keyof T> = {[P in K]-?: T[P]};

export function useAppContext<
  K extends keyof AppContextType,
  O extends keyof AppContextType = never,
>(
  requiredKeys: K[],
  optionalKeys?: O[]
): EnforceRequired<AppContextType, K> & Partial<Pick<AppContextType, O>> {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  // Ensure required keys exist in the context
  requiredKeys.forEach((key) => {
    if (!(key in context) || context[key] === undefined) {
      throw new Error(`Missing required context key: ${String(key)}`);
    }
  });

  // Select required keys
  const selectedContext: AppContextType = {};
  requiredKeys.forEach((key) => {
    selectedContext[key] = context[key] as AppContextType[K];
  });

  // Include only explicitly provided optional keys
  optionalKeys?.forEach((key) => {
    if (key in context) {
      selectedContext[key] = context[key] as AppContextType[O];
    }
  });

  return selectedContext as EnforceRequired<AppContextType, K> & Partial<Pick<AppContextType, O>>;
}
