import React from 'react';
import {useParams} from 'react-router-dom';

import {AppContext} from './contexts';

type Props = {
  children: React.ReactNode;
};

const StationRouterProvider = ({children}: Props) => {
  const params = useParams<'locid' | 'ts_id'>();

  if (!params.locid) {
    throw new Error('locid is required');
  }

  const loc_id = parseInt(params.locid);
  const ts_id = params.ts_id ? parseInt(params.ts_id) : undefined;

  return (
    <AppContext.Provider value={{loc_id: loc_id, ts_id: ts_id}}>{children}</AppContext.Provider>
  );
};

export default StationRouterProvider;
