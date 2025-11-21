import {Box, Typography} from '@mui/material';

import LocationListFilter from './LocationListFilter';
import LocationListVirtualizer from './LocationListVirtualizer';
import {useUser} from '~/features/auth/useUser';

const LocationList = () => {
  const {simpleTaskPermission} = useUser();
  return (
    <Box maxHeight={'100%'} display="flex" flexDirection="column">
      <Typography variant="h6" sx={{padding: 1}}>
        Lokationer
      </Typography>
      {simpleTaskPermission && <LocationListFilter />}
      <LocationListVirtualizer />
    </Box>
  );
};

export default LocationList;
