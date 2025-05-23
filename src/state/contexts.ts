import {createContext, useContext} from 'react';

export const DrawerContext = createContext<'closed' | 'half' | 'full'>('closed');

export const useDrawerContext = () => {
  return useContext(DrawerContext);
};

type AppContextType = {
  loc_id?: number;
  ts_id?: number;
  boreholeno?: string;
  intakeno?: number;
};

export const AppContext = createContext<AppContextType | null>(null);

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
    // permissions: context.ts_id ? permissions?.[context.ts_id] : undefined,
  };
}
