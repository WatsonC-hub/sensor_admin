import DirectionsIcon from '@mui/icons-material/Directions';
import ShowChartRoundedIcon from '@mui/icons-material/ShowChartRounded';
import React from 'react';

import Button from '~/components/Button';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {BoreholeMapData} from '~/types';

type Props = {
  data: BoreholeMapData;
};

const BoreholeActions = ({data}: Props) => {
  const {borehole} = useNavigationFunctions();
  return (
    <>
      <Button
        bttype="tertiary"
        color="primary"
        onClick={() => {
          window.open(
            `https://www.google.com/maps/search/?api=1&query=${data.latitude},${data.longitude}`,
            '_blank'
          );
        }}
        startIcon={<DirectionsIcon />}
      >
        Google Maps
      </Button>
      <Button
        bttype="primary"
        color="primary"
        onClick={() => {
          borehole(data.boreholeno);
        }}
        startIcon={<ShowChartRoundedIcon />}
      >
        Boring
      </Button>
    </>
  );
};

export default BoreholeActions;
