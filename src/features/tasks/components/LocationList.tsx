import {Box, Divider} from '@mui/material';
import React from 'react';
import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';
import {useDisplayState} from '~/hooks/ui';
import LocationListItem from './LocationListItem';
import LocationListFilter from './LocationListFilter';

const LocationList = () => {
  const {listFilteredData} = useFilteredMapData();
  const setLocId = useDisplayState((state) => state.setLocId);
  return (
    <Box>
      <LocationListFilter />
      <Box component="ul" display="flex" flexDirection="column">
        {listFilteredData?.map((item) => {
          if ('loc_id' in item) {
            return (
              <Box key={item.loc_id}>
                <LocationListItem itemData={item} onClick={() => setLocId(item.loc_id)} />
                <Divider />
              </Box>
            );
          }
        })}
      </Box>
    </Box>
  );
};

export default LocationList;
