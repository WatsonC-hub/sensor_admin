import {Stepper, Step, StepLabel, Typography, ButtonBase} from '@mui/material';
import React from 'react';
import {LocationManager} from '../controller/LocationManager';
import {TimeseriesManager} from '../controller/TimeseriesManager';

type Props = {
  locationManager: LocationManager;
  timeseriesManager: TimeseriesManager;
  activeStep: number;
  setActiveStep: (step: number) => void;
  loc_id?: number;
};

const FormSteps = ({
  locationManager,
  timeseriesManager,
  activeStep,
  setActiveStep,
  loc_id,
}: Props) => {
  const isLocationValid = locationManager.get()?.snapshot().valid;
  const isTimeseriesValid = timeseriesManager.list().every((item) => item.agg.snapshot().valid);
  return (
    <Stepper nonLinear activeStep={activeStep} alternativeLabel>
      {loc_id === undefined && (
        <Step
          key={'lokation'}
          completed={isLocationValid && activeStep > 0}
          active={activeStep === 0}
        >
          <ButtonBase
            onClick={async () => activeStep !== 0 && setActiveStep(0)}
            sx={{display: 'block', width: '100%', textAlign: 'left'}}
          >
            <StepLabel
              error={isLocationValid === false}
              optional={<Typography variant="caption">Obligatorisk</Typography>}
            >
              <Typography variant="body1">Lokation</Typography>
            </StepLabel>
          </ButtonBase>
        </Step>
      )}
      <Step
        key={'tidsserie'}
        completed={isTimeseriesValid && activeStep > 1}
        active={activeStep === 1}
      >
        <ButtonBase
          onClick={async () => {
            if (activeStep !== 1) setActiveStep(1);
          }}
          sx={{display: 'block', width: '100%', textAlign: 'left'}}
        >
          <StepLabel
            error={isTimeseriesValid === false}
            optional={
              loc_id === undefined ? (
                <Typography variant="caption">Valgfrit</Typography>
              ) : (
                <Typography variant="caption">Obligatorisk</Typography>
              )
            }
          >
            <Typography variant="body1">Tidsserie</Typography>
          </StepLabel>
        </ButtonBase>
      </Step>
      <Step key={'additional'} active={activeStep === 2}>
        <ButtonBase
          onClick={async () => {
            if (activeStep !== 2) setActiveStep(2);
          }}
          sx={{display: 'block', width: '100%', textAlign: 'left'}}
        >
          <StepLabel optional={<Typography variant="caption">Valgfrit</Typography>}>
            <Typography variant="body1">Yderligere oplysninger</Typography>
          </StepLabel>
        </ButtonBase>
      </Step>
    </Stepper>
  );
};

export default FormSteps;
