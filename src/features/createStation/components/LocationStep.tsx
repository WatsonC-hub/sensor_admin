import {Typography} from '@mui/material';
import React from 'react';

import LocationForm from '../forms/LocationForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import FormStepButtons from './FormStepButtons';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
};

const LocationStep = ({activeStep, setActiveStep}: Props) => {
  const validateSubmitters = useCreateStationStore((state) => state.validateSubmitters);

  return (
    <>
      {activeStep === 0 && (
        <>
          <Typography
            variant="caption"
            sx={{
              alignContent: 'center',
            }}
          >
            Felter markeret med en stjerne (*) er obligatoriske.
          </Typography>
          <LocationForm />
          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'location'}
            onFormIsValid={validateSubmitters}
          />
        </>
      )}
    </>
  );
};

export default LocationStep;
