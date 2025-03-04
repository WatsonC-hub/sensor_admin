import {Box} from '@mui/material';
import React from 'react';
import {useFilteredMapData} from '~/features/map/hooks/useFilteredMapData';
import {useDisplayState} from '~/hooks/ui';

const LocationList = () => {
  const {listFilteredData} = useFilteredMapData();
  const setLocId = useDisplayState((state) => state.setLocId);

  return (
    <Box component="ul" display="flex" flexDirection="column">
      {listFilteredData?.map((item) => {
        if ('loc_id' in item) {
          return (
            <a key={item.loc_id} onClick={() => setLocId(item.loc_id)}>
              {item.loc_name}
            </a>
          );
        }
      })}
    </Box>
  );
};

export default LocationList;
