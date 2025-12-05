import {Stepper, Step, StepButton, StepLabel, Typography, ButtonBase} from '@mui/material';
import React from 'react';
import useCreateStationContext from '../api/useCreateStationContext';

const FormSteps = () => {
  const {activeStep, setActiveStep, formErrors, meta} = useCreateStationContext();
  const isValid = !Object.values(formErrors).some((error) => error === true);
  return (
    <Stepper nonLinear activeStep={activeStep} alternativeLabel>
      {meta?.loc_id === undefined && (
        <Step
          key={'lokation'}
          completed={!formErrors.location && activeStep > 0}
          active={activeStep === 0}
        >
          <StepButton onClick={async () => activeStep !== 0 && setActiveStep(0)}>
            <StepLabel error={formErrors.location}>
              <Typography variant="body1">Lokation</Typography>
            </StepLabel>
          </StepButton>
        </Step>
      )}
      <Step
        key={'tidsserie'}
        completed={!formErrors.timeseries && !formErrors.watlevmp && activeStep > 1}
        active={activeStep === 1}
      >
        <ButtonBase
          onClick={() => activeStep !== 1 && isValid && setActiveStep(1)}
          sx={{display: 'block', width: '100%', textAlign: 'left'}}
        >
          <StepLabel
            error={Boolean(formErrors.timeseries)}
            optional={
              meta?.loc_id === undefined && !formErrors.timeseries ? (
                <Typography variant="caption">Valgfrit</Typography>
              ) : undefined
            }
          >
            <Typography variant="body1">Tidsserie</Typography>
          </StepLabel>
        </ButtonBase>
      </Step>
      <Step key={'udstyr'} active={activeStep === 2} completed={!formErrors.unit && activeStep > 2}>
        <ButtonBase
          onClick={async () => activeStep !== 2 && isValid && setActiveStep(2)}
          sx={{display: 'block', width: '100%', textAlign: 'left'}}
        >
          <StepLabel
            error={Boolean(formErrors.unit)}
            optional={<Typography variant="caption">Valgfrit</Typography>}
          >
            <Typography variant="body1">Udstyr</Typography>
          </StepLabel>
        </ButtonBase>
      </Step>
      <Step key={'additional'} active={activeStep === 3}>
        <ButtonBase
          onClick={async () => activeStep !== 3 && isValid && setActiveStep(3)}
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
