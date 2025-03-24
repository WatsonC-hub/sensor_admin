import {Box} from '@mui/material';

import LocationListFilter from './LocationListFilter';
import LocationListVirtualizer from './LocationListVirtualizer';

const LocationList = () => {
  return (
    <Box>
      <LocationListFilter />
      <LocationListVirtualizer />
    </Box>
  );
};

export default LocationList;
