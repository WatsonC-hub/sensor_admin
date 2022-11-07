import React from 'react';
import {useParams} from 'react-router-dom';
import BearingGraph from 'src/pages/field/Station/BearingGraph';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';

const QualityAssurance = () => {
  let params = useParams();

  const {data, isLoading, error} = useQuery(['test', params.ts_id], async ({signal}) => {
    const {data} = await apiClient.get(`/sensor_admin/quick/${params.ts_id}`, {
      signal,
    });
    return data;
  });

  return <BearingGraph stationId={params.ts_id} measurements={[]} dynamicMeasurement={[]} />;
};

export default QualityAssurance;
