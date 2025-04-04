import {Box} from '@mui/material';

import LocationListFilter from './LocationListFilter';
import LocationListVirtualizer from './LocationListVirtualizer';

const LocationList = () => {
  return (
    <Box maxHeight={'100%'} display="flex" flexDirection="column">
      <LocationListFilter />
      <LocationListVirtualizer />
    </Box>
  );
};

export default LocationList;
