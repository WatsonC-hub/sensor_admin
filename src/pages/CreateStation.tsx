import React, {useState} from 'react';
import NavBar from '~/components/NavBar';
import {Box, Grid2, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';

import TooltipWrapper from '~/components/TooltipWrapper';

import LocationStep from '~/features/createStation/components/LocationStep';
import FormSteps from '~/features/createStation/components/FormSteps';
import TimeseriesStep from '~/features/createStation/components/TimeseriesStep';
import AdditionalStep from '~/features/createStation/components/AdditionalStep';
import {CreateLocationData} from '~/features/createStation/types';
import {useLocation} from 'react-router-dom';
import CreateStationStoreProvider from '~/features/createStation/state/CreateStationStoreProvider';
import {useLocationData} from '~/hooks/query/useMetadata';

const CreateStation = () => {
  let {state} = useLocation();
  const [activeStep, setActiveStep] = useState(state?.loc_id ? 1 : 0);
  state = {
    ...state,
    terrainqual: 'DTM',
  } as CreateLocationData;
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const {data} = useLocationData(state?.loc_id);

  if (!data && state?.loc_id !== undefined) return null;

  return (
    <CreateStationStoreProvider defaultValues={{location: {meta: {...data, ...state}}}}>
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
                {state?.loc_id === undefined
                  ? 'Opret ny station'
                  : `Tilføj til station: ${state.loc_name}`}
              </Typography>
            </TooltipWrapper>
          </Box>
          {state.loc_id === undefined && (
            <>
              <FormSteps activeStep={activeStep} loc_id={state.loc_id} />
              <LocationStep activeStep={activeStep} setActiveStep={setActiveStep} />
              <AdditionalStep activeStep={activeStep} setActiveStep={setActiveStep} />
            </>
          )}
          <TimeseriesStep
            key="ts"
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            loc_id={state.loc_id}
          />
        </Grid2>
      </Box>
    </CreateStationStoreProvider>
  );
};

export default CreateStation;
