import {Stepper, Step, StepButton, StepLabel, Typography} from '@mui/material';
import React from 'react';
import useCreateStationContext from '../api/useCreateStationContext';

const FormSteps = () => {
  const {activeStep, setActiveStep, formErrors} = useCreateStationContext();
  return (
    <Stepper nonLinear activeStep={activeStep} alternativeLabel>
      <Step key={'lokation'} completed={!formErrors.location && activeStep > 0}>
        <StepButton
          onClick={async () => {
            if (
              activeStep !== 0
              //   &&
              //   Object.keys(formErrors).some(
              //     (key) => key !== 'location' && formErrors[key] === true
              //   ) === false
            ) {
              setActiveStep(0);
            }
          }}
        >
          <StepLabel error={formErrors.location}>
            <Typography variant="body2" textTransform={'capitalize'}>
              Lokation
            </Typography>
          </StepLabel>
        </StepButton>
      </Step>
      <Step
        key={'tidsserie'}
        completed={!formErrors.timeseries && !formErrors.watlevmp && activeStep > 1}
      >
        <StepButton
          onClick={async () => {
            if (
              activeStep !== 1
              //   &&
              //   Object.keys(formErrors).some(
              //     (key) => key !== 'timeseries' && formErrors[key] === true
              //   ) === false
            ) {
              setActiveStep(1);
            }
          }}
        >
          <StepLabel error={formErrors.timeseries || formErrors.watlevmp}>
            <Typography variant="body2" textTransform={'capitalize'}>
              Tidsserie
            </Typography>
          </StepLabel>
        </StepButton>
      </Step>
      <Step key={'udstyr'}>
        <StepButton
          onClick={async () => {
            if (activeStep !== 2) {
              setActiveStep(2);
            }
          }}
        >
          <StepLabel error={formErrors.unit}>
            <Typography variant="body2" textTransform={'capitalize'}>
              Udstyr
            </Typography>
          </StepLabel>
        </StepButton>
      </Step>
    </Stepper>
  );
};

export default FormSteps;
