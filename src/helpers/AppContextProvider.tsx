import React from 'react';
import {AppContext, AppContextType, useAppContext} from '~/state/contexts';

type Props = {
  children?: React.ReactNode;
  values?: AppContextType | null;
};

const AppContextProvider = ({children, values}: Props) => {
  const {loc_id, ts_id} = useAppContext(undefined, ['loc_id', 'ts_id']);

  return <AppContext.Provider value={{loc_id, ts_id, ...values}}>{children}</AppContext.Provider>;
};

export default AppContextProvider;
