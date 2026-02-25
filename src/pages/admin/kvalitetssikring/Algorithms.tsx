import {Box, Divider, Grid2 as Grid, Typography} from '@mui/material';

import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import AlgorithmCard from '~/pages/admin/kvalitetssikring/AlgorithmCard';
import useBreakpoints from '~/hooks/useBreakpoints';
import GraphManager from '~/features/station/components/GraphManager';
import TooltipWrapper from '~/components/TooltipWrapper';
import React, {useEffect} from 'react';

const Algorithms = () => {
  const {isMobile} = useBreakpoints();
  const {
    get: {data},
  } = useAlgorithms();

  const [columns, setColumns] = React.useState(6);
  const [mobileRatio, setMobileRatio] = React.useState(false);

  useEffect(() => {
    const resizeObserver = new ResizeObserver((event) => {
      const width = event[0].contentRect.width;
      const mobileRatio = width < 800;
      const size = mobileRatio ? 300 : 480;
      setMobileRatio(mobileRatio);
      if (!mobileRatio && data && data.length > 2) {
        const calculatedColumns = Math.floor(12 / Math.floor(width / size));
        setColumns(calculatedColumns);
      }
    });
    const main_content = document.getElementById('main_content');
    if (resizeObserver && main_content !== null) resizeObserver.observe(main_content);

    return () => resizeObserver.disconnect();
  }, [data]);
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
        <Box display="flex" justifyContent="space-between" alignItems="center" minWidth={800}>
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
          justifyContent={data && data.length < 4 ? 'center' : 'start'}
        >
          {data?.map((algorithm) => (
            <Grid key={algorithm.name} size={mobileRatio || data.length === 1 ? 12 : columns}>
              <AlgorithmCard qaAlgorithm={algorithm} />
            </Grid>
          ))}
        </Grid>
      </StationPageBoxLayout>
    </>
  );
};

export default Algorithms;
