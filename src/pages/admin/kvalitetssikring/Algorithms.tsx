import {Box, Divider, Grid2 as Grid, Typography} from '@mui/material';

import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';
import {useAppContext} from '~/state/contexts';
import useBreakpoints from '~/hooks/useBreakpoints';
import GraphManager from '~/features/station/components/GraphManager';
import TooltipWrapper from '~/components/TooltipWrapper';

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
        <Box display={'flex'}>
          <TooltipWrapper
            url="https://watsonc.dk/guides/kvalitetssikring"
            description="På denne side kan du justere advarsler for din tidsserie. Læs mere om hvad du kan i dokumentationen."
          >
            <Typography variant="h5">Juster advarsler</Typography>
          </TooltipWrapper>
        </Box>
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
