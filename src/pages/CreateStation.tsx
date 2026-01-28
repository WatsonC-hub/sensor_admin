import React, {useEffect, useState} from 'react';
import NavBar from '~/components/NavBar';
import {Box, Grid2, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';

import TooltipWrapper from '~/components/TooltipWrapper';

import LocationStep from '~/features/createStation/components/LocationStep';
import FormSteps from '~/features/createStation/components/FormSteps';
import TimeseriesStep from '~/features/createStation/components/TimeseriesStep';
import useCreateStationContext from '~/features/createStation/api/useCreateStationContext';
import AdditionalStep from '~/features/createStation/components/AdditionalStep';
import {AggregateController} from '~/features/createStation/controller/AggregateController';
import {CreateLocationData, CreateStationPayload} from '~/features/createStation/controller/types';
import {TimeseriesManager} from '~/features/createStation/controller/TimeseriesManager';
import {useLocation} from 'react-router-dom';
import {LocationManager} from '~/features/createStation/controller/LocationManager';
import {useCreateStationStore} from '~/features/createStation/state/store';

const CreateStation = () => {
  let {state} = useLocation();
  const [activeStep, setActiveStep] = useState(state?.loc_id ? 1 : 0);
  state = {
    ...state,
    terrainqual: 'DTM',
  } as CreateLocationData;
  const {isMobile} = useBreakpoints();
  const {meta} = useCreateStationContext();
  const size = isMobile ? 12 : 6;

  const [setState, submitters] = useCreateStationStore((state) => [
    state.setState,
    state.submitters,
  ]);

  useEffect(() => {
    setState('location.meta', {...state});
  }, []);

  console.log('submitters', submitters);

  const [rootController] = useState(new AggregateController<CreateStationPayload>());
  const [timeseriesManager] = useState(new TimeseriesManager(rootController));
  const [locationManager] = useState(new LocationManager(rootController, state));

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
          {state.loc_id === undefined && (
            <>
              <FormSteps
                locationManager={locationManager}
                timeseriesManager={timeseriesManager}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
              />
              <LocationStep
                locationManager={locationManager}
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                defaultState={state}
              />
              <AdditionalStep
                activeStep={activeStep}
                setActiveStep={setActiveStep}
                RootController={rootController}
                locationManager={locationManager}
              />
            </>
          )}
          <TimeseriesStep
            key="ts"
            timeseriesManager={timeseriesManager}
            RootController={rootController}
            activeStep={activeStep}
            setActiveStep={setActiveStep}
          />
        </Grid2>
      </Box>
    </>
  );
};

export default CreateStation;
