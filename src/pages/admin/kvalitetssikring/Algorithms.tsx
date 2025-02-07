import {Grid} from '@mui/material';
import React, {useContext} from 'react';

import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';
import {MetadataContext} from '~/state/contexts';

const Algorithms = () => {
  const metadata = useContext(MetadataContext);
  const ts_id = metadata?.ts_id;
  const {
    get: {data},
  } = useAlgorithms(ts_id);

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
