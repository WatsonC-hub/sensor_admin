import React from 'react';
import {useParams} from 'react-router-dom';

import {AppContext} from './contexts';

type Props = {
  children: React.ReactNode;
};

const AdminRouterProvider = ({children}: Props) => {
  const params = useParams<'ts_id'>();

  const ts_id = params.ts_id ? parseInt(params.ts_id) : undefined;

  return <AppContext.Provider value={{ts_id: ts_id}}>{children}</AppContext.Provider>;
};

export default AdminRouterProvider;
