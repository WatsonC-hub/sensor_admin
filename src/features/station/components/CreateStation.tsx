import React from 'react';
import NavBar from '~/components/NavBar';
import {Box, Grid2, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';

import TooltipWrapper from '~/components/TooltipWrapper';

import LocationStep from '../createStation/components/LocationStep';
import FormSteps from '../createStation/components/FormSteps';
import TimeseriesStep from '../createStation/components/TimeseriesStep';
import useCreateStationContext from '../createStation/api/useCreateStationContext';
import AdditionalStep from '../createStation/components/AdditionalStep';
import {AggregateController} from '../createStation/controller/AggregateController';
import {RootPayload} from '../createStation/controller/types';
import {TimeseriesManager} from '../createStation/controller/TimeseriesManager';

const CreateStation = () => {
  const {isMobile} = useBreakpoints();
  const {meta} = useCreateStationContext();
  const size = isMobile ? 12 : 6;
  const parent = new AggregateController<RootPayload>();
  const manager = new TimeseriesManager(parent);

  console.log('AggregateController initialized with slices:', parent.getSlices());

  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Logo />
        <NavBar.Menu />
      </NavBar>
      <Box display="flex" flexDirection={'column'} overflow="auto">
        <Grid2
          container
          alignSelf={'center'}
          display={'flex'}
          flexDirection={'column'}
          spacing={1.5}
          sx={{maxWidth: 1200, width: '100%'}}
          mx={'auto'}
          px={1}
          size={size}
          py={2}
        >
          <Box display={'flex'} flexDirection={'row'} justifyContent={'center'} width="100%">
            <TooltipWrapper
              description="Læs mere om hvordan en lokation oprettes"
              url="https://www.watsonc.dk/guides/opret-ny-lokation-tidsserie/"
            >
              <Typography variant="h5" textAlign={'center'} fontWeight={'bold'}>
                {meta?.loc_id === undefined
                  ? 'Opret ny station'
                  : `Tilføj til station: ${meta.loc_name}`}
              </Typography>
            </TooltipWrapper>
          </Box>
          <FormSteps />
          {meta?.loc_id === undefined && <LocationStep />}
          <TimeseriesStep key="ts" manager={manager} />
          <AdditionalStep />
        </Grid2>
      </Box>
    </>
  );
};

export default CreateStation;
