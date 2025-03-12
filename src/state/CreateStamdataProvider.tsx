import React from 'react';

import {AppContext} from './contexts';

type Props = {
  children: React.ReactNode;
};

const CreateStamdataProvider = ({children}: Props) => {
  return <AppContext.Provider value={{}}>{children}</AppContext.Provider>;
};

export default CreateStamdataProvider;
