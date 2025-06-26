import {Box} from '@mui/material';

import LocationListFilter from './LocationListFilter';
import LocationListVirtualizer from './LocationListVirtualizer';
import {useUser} from '~/features/auth/useUser';

const LocationList = () => {
  const user = useUser();
  return (
    <Box maxHeight={'100%'} display="flex" flexDirection="column">
      {user?.simpleTaskPermission && <LocationListFilter />}
      <LocationListVirtualizer />
    </Box>
  );
};

export default LocationList;
