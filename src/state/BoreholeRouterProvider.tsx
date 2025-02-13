import React from 'react';
import {useParams} from 'react-router-dom';

import {AppContext} from './contexts';

type Props = {
  children: React.ReactNode;
};

const BoreholeRouterProvider = ({children}: Props) => {
  const params = useParams<'boreholeno' | 'intakeno'>();

  if (!params.boreholeno) {
    throw new Error('boreholeno is required');
  }

  const boreholeno = params.boreholeno;
  const intakeno = params.intakeno ? parseInt(params.intakeno) : undefined;

  return (
    <AppContext.Provider value={{boreholeno: boreholeno, intakeno: intakeno}}>
      {children}
    </AppContext.Provider>
  );
};

export default BoreholeRouterProvider;
