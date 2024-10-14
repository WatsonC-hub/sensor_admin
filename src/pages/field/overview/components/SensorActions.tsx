import DirectionsIcon from '@mui/icons-material/Directions';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import React from 'react';

import Button from '~/components/Button';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type Props = {
  data: NotificationMap;
};

const SensorActions = ({data}: Props) => {
  const {location} = useNavigationFunctions();
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
          location(data.loc_id);
        }}
        startIcon={<LocationOnRounded />}
      >
        Lokation
      </Button>
    </>
  );
};

export default SensorActions;
