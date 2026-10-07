import {Box, Typography} from '@mui/material';

import {useUser} from '~/features/auth/useUser';

import LocationListFilter from './LocationListFilter';
import LocationListVirtualizer from './LocationListVirtualizer';

const LocationList = () => {
  const {simpleTaskPermission} = useUser();
  return (
    <Box
      sx={{
        maxHeight: '100%',
        display: 'flex',
        flexDirection: 'column',
      }}
    >
      <Typography variant="h6" sx={{padding: 1}}>
        Lokationer
      </Typography>
      {simpleTaskPermission && <LocationListFilter />}
      <LocationListVirtualizer />
    </Box>
  );
};

export default LocationList;
