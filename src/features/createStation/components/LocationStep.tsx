import React from 'react';

import FormStepButtons from './FormStepButtons';
import {useCreateStationStore} from '../state/useCreateStationStore';
import LocationForm from '../forms/LocationForm';
import {Typography} from '@mui/material';

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
          <Typography variant="caption" alignContent={'center'}>
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
