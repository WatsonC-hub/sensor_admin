import {Box, Divider, Grid2 as Grid} from '@mui/material';

import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';
import {useAppContext} from '~/state/contexts';
import useBreakpoints from '~/hooks/useBreakpoints';
import GraphManager from '~/features/station/components/GraphManager';

const Algorithms = () => {
  const {ts_id} = useAppContext(['ts_id']);
  const {isMobile} = useBreakpoints();
  const {
    get: {data},
  } = useAlgorithms(ts_id);

  return (
    <>
      <Box display="flex" flexDirection={isMobile ? 'column-reverse' : 'row'}>
        <Box width={'100%'}>
          <GraphManager
            defaultDataToShow={{
              Kontrolmålinger: true,
              Godkendt: true,
              Algoritmer: true,
            }}
          />
        </Box>
        {/* <DataToShow /> */}
      </Box>
      <Divider />
      <StationPageBoxLayout>
        <Grid
          container
          direction={'row'}
          justifyContent={data && data.length < 4 ? 'center' : 'start'}
        >
          {data?.map((algorithm) => (
            <Grid
              key={algorithm.name}
              size={{
                mobile: 12,
                tablet: 6,
                laptop: 4,
                desktop: 4,
                xl: 4,
              }}
            >
              <AlgorithmCard qaAlgorithm={algorithm} />
            </Grid>
          ))}
        </Grid>
      </StationPageBoxLayout>
    </>
  );
};

export default Algorithms;
