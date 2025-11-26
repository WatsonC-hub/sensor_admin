import React from 'react';
import NavBar from '~/components/NavBar';
import {Box, Grid2, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';

import TooltipWrapper from '~/components/TooltipWrapper';

import CreateStationContextProvider from '~/helpers/CreateStationContextProvider';
import LocationStep from '../createStation/components/LocationStep';
import FormSteps from '../createStation/components/FormSteps';
import TimeseriesStep from '../createStation/components/TimeseriesStep';
import UnitStep from '../createStation/components/UnitStep';

const CreateStation = () => {
  const {isMobile} = useBreakpoints();
  // const [showAlert, setShowAlert] = useState(false);
  const size = isMobile ? 12 : 6;

  return (
    <CreateStationContextProvider>
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
                Opret ny station
              </Typography>
            </TooltipWrapper>
          </Box>
          <FormSteps />
          <LocationStep />
          <TimeseriesStep />
          <UnitStep />
        </Grid2>
      </Box>
      {/* <AlertDialog
        open={showAlert}
        setOpen={setShowAlert}
        title={alertTitle}
        message={alertMessage}
        handleOpret={() => {
          if (activeStep === 0) {
            handleLocationSubmit();
          } else if (activeStep === 1 || (activeStep === 2 && !isUnitDirty)) {
            handleTimeseriesSubmit();
          }
        }}
      /> */}
    </CreateStationContextProvider>
  );
};

export default CreateStation;
