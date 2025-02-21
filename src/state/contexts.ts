import {queryOptions, useQuery} from '@tanstack/react-query';
import {createContext, useContext} from 'react';

import {apiClient} from '~/apiClient';

// import {StationDetails} from '~/types';

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

export type LocationPermissions = Record<number, 'read' | 'edit'>;

export const AppContext = createContext<AppContextType | null>(null);

export const usePermissionsQueryOptions = (loc_id?: number) => {
  return queryOptions({
    queryKey: ['permissions', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get<LocationPermissions>(
        `/auth/me/location_permissions/${loc_id}`
      );
      return data;
    },
    enabled: loc_id !== undefined,
  });
};

// Utility type to make required keys non-optional while keeping optional ones unchanged
type EnforceRequired<T, K extends keyof T> = {[P in K]-?: T[P]};

export function useAppContext<
  K extends keyof AppContextType = never,
  O extends keyof AppContextType = never,
>(requiredKeys?: K[], optionalKeys?: O[]) {
  const context = useContext(AppContext);

  if (!context) {
    throw new Error('useAppContext must be used within an AppProvider');
  }

  const {data: permissions} = useQuery(usePermissionsQueryOptions(context.loc_id));

  if (context.ts_id && permissions && permissions[context.ts_id] === undefined)
    throw new Error(`Missing permissions on timeseries: ${String(context.ts_id)}`);

  // Ensure required keys exist in the context
  requiredKeys?.forEach((key) => {
    if (!(key in context) || context[key] === undefined) {
      throw new Error(`Missing required context key: ${String(key)}`);
    }
  });

  // Select required keys
  const selectedContext: AppContextType = {};
  requiredKeys?.forEach((key) => {
    selectedContext[key] = context[key] as AppContextType[K];
  });

  // Include only explicitly provided optional keys
  optionalKeys?.forEach((key) => {
    if (key in context) {
      selectedContext[key] = context[key] as AppContextType[O];
    }
  });

  return {
    ...(selectedContext as EnforceRequired<AppContextType, K> & Partial<Pick<AppContextType, O>>),
    permissions: context.ts_id ? permissions?.[context.ts_id] : undefined,
  };
}
