import DirectionsIcon from '@mui/icons-material/Directions';
import LocationOnRounded from '@mui/icons-material/LocationOnRounded';
import {useQueryClient} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';
import {NotificationMap} from '~/hooks/query/useNotificationOverview';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

type Props = {
  data: NotificationMap;
};

const SensorActions = ({data}: Props) => {
  const queryClient = useQueryClient();

  const handlePrefetch = () => {
    queryClient.prefetchQuery({
      queryKey: ['stations', data.loc_id],
      queryFn: async () => {
        const {data: out} = await apiClient.get(
          `/sensor_field/station/metadata_location/${data.loc_id}`
        );
        return out;
      },
    });
  };

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
        onFocus={handlePrefetch}
        onMouseEnter={handlePrefetch}
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
