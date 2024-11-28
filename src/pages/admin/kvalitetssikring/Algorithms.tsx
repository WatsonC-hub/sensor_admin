import {Grid} from '@mui/material';
import React from 'react';
import {useParams} from 'react-router-dom';

import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';

const Algorithms = () => {
  const params = useParams();
  const {
    get: {data},
  } = useAlgorithms(params.ts_id);

  return (
    <>
      <Grid
        container
        direction={'row'}
        justifyContent={data && data.length < 4 ? 'center' : 'start'}
      >
        {data?.map((algorithm) => (
          <Grid key={algorithm.name} item mobile={12} tablet={6} laptop={4} desktop={4} xl={4}>
            <AlgorithmCard qaAlgorithm={algorithm} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Algorithms;
