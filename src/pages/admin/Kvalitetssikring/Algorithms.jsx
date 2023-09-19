import React from 'react';
import {Grid, Typography} from '@mui/material';
import {apiClient} from 'src/apiClient';
import {useParams} from 'react-router-dom';

import {useQuery} from '@tanstack/react-query';
import AlgorithmCard from './AlgorithmCard';

const Algorithms = () => {
  let params = useParams();

  const {data} = useQuery(['algorithms', params.ts_id], async () => {
    const {data} = await apiClient.get(`/sensor_admin/algorithms/${params.ts_id}`);
    return data;
  });

  console.log(data);

  return (
    <>
      <Typography variant="h6">Algoritmer</Typography>
      <Grid container sx={{borderRadius: 2, border: 2, borderColor: 'primary.main'}}>
        {data?.map((algorithm) => (
          <Grid item xs={12} sm={6}>
            <AlgorithmCard algorithm={algorithm} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Algorithms;
