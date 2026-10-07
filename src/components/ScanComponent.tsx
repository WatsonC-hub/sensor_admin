import {CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

export default function ScanComponent() {
  const params = useParams();
  const {home, location, station, boreholeIntake} = useNavigationFunctions();

  const {data, isError, isPending} = useQuery({
    queryKey: ['labelid', params.labelid],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/calypso_id/${params.labelid}`);
      return data;
    },
  });

  useEffect(() => {
    if (isPending) return;

    if (!isError) {
      if (data.loc_id) {
        location(data.loc_id);
        if (data.ts_id) station(data.ts_id);
      } else if (data.boreholeno) {
        if (data.intakeno) boreholeIntake(data.boreholeno, data.intakeno);
      } else {
        toast.error('Ukendt fejl', {
          autoClose: 2000,
        });
      }
    }

    home();
  }, [isPending, isError, data, home, location, station, boreholeIntake]);

  return <CircularProgress />;
}
