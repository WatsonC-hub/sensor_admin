import {Box, Grid, Typography} from '@mui/material';
import React, {useState} from 'react';
import {useLocation} from 'react-router-dom';

import NavBar from '~/components/NavBar';
import TooltipWrapper from '~/components/TooltipWrapper';
import {useUser} from '~/features/auth/useUser';
import AdditionalStep from '~/features/createStation/components/AdditionalStep';
import FormSteps from '~/features/createStation/components/FormSteps';
import LocationStep from '~/features/createStation/components/LocationStep';
import TimeseriesStep from '~/features/createStation/components/TimeseriesStep';
import CreateStationStoreProvider from '~/features/createStation/state/CreateStationStoreProvider';
import {useLocationData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';

import type {CreateLocationData} from '~/features/createStation/types';

const CreateStation = () => {
  let {state} = useLocation();
  const {superUser} = useUser();
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
    <CreateStationStoreProvider
      defaultValues={{
        location: {
          meta: {...data, ...state},
          contacts: [],
          location_access: [],
          sla: superUser
            ? {
                days_to_visitation: 20,
              }
            : undefined,
        },
      }}
    >
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Logo />
        <NavBar.Menu />
      </NavBar>
      <Box
        sx={{
          display: 'flex',
          flexDirection: 'column',
          overflow: 'auto',
        }}
      >
        <Grid
          container
          spacing={0.5}
          size={size}
          sx={{
            alignSelf: 'center',
            display: 'flex',
            flexDirection: 'column',
            mx: 'auto',
            px: 1,
            py: 2,
            maxWidth: 1000,
            width: '100%',
          }}
        >
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'row',
              justifyContent: 'center',
              width: '100%',
            }}
          >
            <TooltipWrapper
              description="Læs mere om hvordan en lokation oprettes"
              url="https://www.watsonc.dk/guides/opret-ny-lokation-tidsserie/"
            >
              <Typography
                variant="h5"
                sx={{
                  textAlign: 'center',
                  fontWeight: 'bold',
                }}
              >
                {state?.loc_id === undefined
                  ? 'Oprettelse'
                  : `Tilføj tidsserier til: ${state.loc_name}`}
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
        </Grid>
      </Box>
    </CreateStationStoreProvider>
  );
};

export default CreateStation;
