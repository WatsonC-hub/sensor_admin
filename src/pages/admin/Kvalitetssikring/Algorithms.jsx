import {Grid} from '@mui/material';
import React from 'react';
import {useParams} from 'react-router-dom';
import {apiClient} from '~/apiClient';

import {useQuery} from '@tanstack/react-query';
import AlgorithmCard from './AlgorithmCard';

const Algorithms = () => {
  let params = useParams();

  const {data} = useQuery({
    queryKey: ['algorithms', params.ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/algorithms/${params.ts_id}`);
      return data;
    },
  });

  return (
    <>
      <Grid container sx={{borderRadius: 2, border: 2, borderColor: 'primary.main'}}>
        {data?.map((algorithm) => (
          <Grid key={algorithm.name} item xs={12} sm={6}>
            <AlgorithmCard algorithm={algorithm} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Algorithms;
