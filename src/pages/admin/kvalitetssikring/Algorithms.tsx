import {Box, Divider, Grid, Typography} from '@mui/material';
import dayjs from 'dayjs';
import React, {useEffect} from 'react';

import TooltipWrapper from '~/components/TooltipWrapper';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import {useUnitHistory} from '~/features/stamdata/api/useUnitHistory';
import GraphManager from '~/features/station/components/GraphManager';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import useBreakpoints from '~/hooks/useBreakpoints';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';

const Algorithms = () => {
  const {isMobile} = useBreakpoints();
  const {
    get: {data},
  } = useAlgorithms();

  const [columns, setColumns] = React.useState(6);
  const [mobileRatio, setMobileRatio] = React.useState(false);

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

  useEffect(() => {
    const resizeObserver = new ResizeObserver((event) => {
      const width = event[0].contentRect.width;
      const mobileRatio = width < 800;
      const size = mobileRatio ? 300 : 480;
      setMobileRatio(mobileRatio);
      if (!mobileRatio && filtered_data && filtered_data.length > 2) {
        const calculatedColumns = Math.floor(12 / Math.floor(width / size));
        setColumns(calculatedColumns);
      }
    });
    const main_content = document.getElementById('main_content');
    if (resizeObserver && main_content !== null) resizeObserver.observe(main_content);

    return () => resizeObserver.disconnect();
  }, [filtered_data]);
  return (
    <>
      <Box
        sx={{
          display: 'flex',
          flexDirection: isMobile ? 'column-reverse' : 'row',
        }}
      >
        <Box
          sx={{
            width: '100%',
          }}
        >
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
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            minWidth: 800,
          }}
        >
          <TooltipWrapper
            description="På denne side kan du se de algoritmer, der er tilgængelige for tidsserien. Læs mere om algoritmer i guiden."
            url="https://www.watsonc.dk/guides/side-oversigt/#juster-advarsler"
          >
            <Typography variant="h5">Advarsler</Typography>
          </TooltipWrapper>
        </Box>
        <Grid
          container
          direction={'row'}
          sx={{
            justifyContent: filtered_data && filtered_data.length < 4 ? 'center' : 'start',
          }}
        >
          {filtered_data?.map((algorithm) => (
            <Grid
              key={algorithm.name}
              sx={{size: mobileRatio || filtered_data.length === 1 ? 12 : columns}}
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
