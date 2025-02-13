import {Grid} from '@mui/material';

import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';
import {useAppContext} from '~/state/contexts';

const Algorithms = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const {
    get: {data},
  } = useAlgorithms(ts_id);

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
