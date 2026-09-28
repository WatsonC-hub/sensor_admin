import {Box, Divider, Typography} from '@mui/material';
import dayjs from 'dayjs';
import React from 'react';

import TooltipWrapper from '~/components/TooltipWrapper';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import GraphManager from '~/features/station/components/GraphManager';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';

const Algorithms = () => {
  const {
    get: {data},
  } = useAlgorithms();

  const {data: unit_history} = useUnitHistory();

  const filtered_data = data?.filter((algorithm) => {
    if (
      algorithm.algorithm === 'SendMeasureIntervalThreshold' &&
      dayjs(unit_history?.[0].slutdato) < dayjs()
    ) {
      return false;
    }
    return true;
  });

  return (
    <>
      <Box>
        <GraphManager
          defaultDataToShow={{
            Kontrolmålinger: true,
            Godkendt: true,
            Algoritmer: true,
          }}
        />
      </Box>
      <Divider />
      <StationPageBoxLayout sx={{width: '100%'}}>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
          }}
        >
          <TooltipWrapper
            description="På denne side kan du se de algoritmer, der er tilgængelige for tidsserien. Læs mere om algoritmer i guiden."
            url="https://www.watsonc.dk/guides/side-oversigt/#juster-advarsler"
          >
            <Typography variant="h5">Advarsler</Typography>
          </TooltipWrapper>
        </Box>
        <Box
          sx={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(min(350px, 100%), 480px))',
            justifyContent: 'center',
          }}
        >
          {filtered_data?.map((algorithm) => (
            <AlgorithmCard key={algorithm.name} qaAlgorithm={algorithm} />
          ))}
        </Box>
      </StationPageBoxLayout>
    </>
  );
};

export default Algorithms;
