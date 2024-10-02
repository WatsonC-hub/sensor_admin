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

  // const {data} = useQuery({
  //   queryKey: ['algorithms', params.ts_id],
  //   queryFn: async () => {
  //     const {data} = await apiClient.get<Array<QaAlgorithms>>(
  //       `/sensor_admin/algorithms/${params.ts_id}`
  //     );
  //     return data;
  //   },
  // });

  return (
    <>
      <Grid
        container
        sx={
          data && data.length > 0 ? {borderRadius: 2, border: 2, borderColor: 'primary.main'} : {}
        }
      >
        {data?.map((algorithm) => (
          <Grid key={algorithm.name} item xs={12} sm={6}>
            <AlgorithmCard qaAlgorithm={algorithm} />
          </Grid>
        ))}
      </Grid>
    </>
  );
};

export default Algorithms;
