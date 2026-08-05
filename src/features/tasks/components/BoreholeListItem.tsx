import {Box, Typography} from '@mui/material';
import React from 'react';

import type {BoreholeMapData} from '~/types';
import BoreholeIcon from '~/pages/field/overview/components/BoreholeIcon';
type Props = {
  itemData: BoreholeMapData;
  onClick: () => void;
};

const BoreholeListItem = ({itemData, onClick}: Props) => {
  return (
    <Box
      sx={{
        display: 'flex',
        flexDirection: 'row',
        alignItems: 'center',
        width: '100%',

        ':hover': {
          backgroundColor: 'grey.100',
        },
      }}
    >
      <Box
        sx={{
          ml: 0.5,
        }}
      >
        <BoreholeIcon iconDetails={itemData} />
      </Box>
      <Box
        onClick={onClick}
        sx={{
          display: 'flex',
          flexDirection: 'column',
          flexGrow: 1,
          py: 0.5,
          px: 1,
          cursor: 'pointer',
        }}
      >
        <Box
          sx={{
            display: 'flex',
            flexDirection: 'row',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          <Typography>{itemData.boreholeno}</Typography>
        </Box>
      </Box>
    </Box>
  );
};

export default BoreholeListItem;
