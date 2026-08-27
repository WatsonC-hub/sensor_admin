import React, {useMemo} from 'react';

import {AppContext, useAppContext} from '~/state/contexts';

import type {AppContextType} from '~/state/contexts';

type Props = {
  children?: React.ReactNode;
  values?: AppContextType | null;
};

const AppContextProvider = ({children, values}: Props) => {
  const {loc_id, ts_id} = useAppContext(undefined, ['loc_id', 'ts_id']);

  const contextValue = useMemo(() => ({loc_id, ts_id, ...values}), [loc_id, ts_id, values]);

  return <AppContext.Provider value={contextValue}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
