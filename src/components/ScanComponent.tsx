import {CircularProgress} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {Navigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';

export default function ScanComponent() {
  const params = useParams();

  const {data, isError, isPending} = useQuery({
    queryKey: ['labelid', params.labelid],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/calypso_id/${params.labelid}`);
      return data;
    },
  });

  if (isPending) {
    return <CircularProgress />;
  }

  if (isError) {
    return <Navigate to="/field" replace={true} />;
  }

  let redirect = '/field';
  if (data.loc_id) {
    if (data.ts_id) {
      redirect = `/field/location/${data.loc_id}/${data.ts_id}`;
    } else {
      redirect = `/field/location/${data.loc_id}`;
    }
  } else if (data.boreholeno) {
    if (data.intakeno) {
      redirect = `/field/borehole/${data.boreholeno}/${data.intakeno}`;
    } else {
      redirect = `/field/borehole/${data.boreholeno}`;
    }
  } else {
    toast.error('Ukendt fejl', {
      autoClose: 2000,
    });
  }

  return <Navigate to={redirect} replace={true} />;
}
