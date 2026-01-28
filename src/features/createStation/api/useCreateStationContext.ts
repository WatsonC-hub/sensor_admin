import {useContext} from 'react';
import {CreateStationContext} from '~/helpers/CreateStationContextProvider';

const useCreateStationContext = () => {
  const context = useContext(CreateStationContext);

  if (!context) {
    throw new Error('useCreateStationContext must be used within a CreateStationProvider');
  }

  return context;
};

export default useCreateStationContext;
