import {Stepper, Step, StepLabel, Typography, ButtonBase} from '@mui/material';
import React from 'react';
import useCreateStationContext from '../api/useCreateStationContext';

const FormSteps = () => {
  const {activeStep, setActiveStep, formErrors, formState, setFormErrors, meta} =
    useCreateStationContext();

  const validateLocationStep = async () => {
    if (meta?.loc_id === undefined) {
      setFormErrors(() => ({
        ...formErrors,
        location: !(
          formState.location !== undefined &&
          formState.location.loctype_id !== -1 &&
          formState.location.loc_name !== '' &&
          formState.location.loc_name !== undefined &&
          formState.location.initial_project_no !== '' &&
          formState.location.initial_project_no !== undefined
        ),
      }));
    }
  };

  return (
    <Stepper nonLinear activeStep={activeStep} alternativeLabel>
      {meta?.loc_id === undefined && (
        <Step
          key={'lokation'}
          completed={!formErrors.location && activeStep > 0}
          active={activeStep === 0}
        >
          <ButtonBase
            onClick={async () => activeStep !== 0 && setActiveStep(0)}
            sx={{display: 'block', width: '100%', textAlign: 'left'}}
          >
            <StepLabel
              error={Boolean(formErrors.location)}
              optional={<Typography variant="caption">Obligatorisk</Typography>}
            >
              <Typography variant="body1">Lokation</Typography>
            </StepLabel>
          </ButtonBase>
        </Step>
      )}
      <Step
        key={'tidsserie'}
        completed={!formErrors.timeseries && !formErrors.watlevmp && activeStep > 1}
        active={activeStep === 1}
      >
        <ButtonBase
          onClick={async () => {
            await validateLocationStep();
            if (activeStep !== 1) setActiveStep(1);
          }}
          sx={{display: 'block', width: '100%', textAlign: 'left'}}
        >
          <StepLabel
            error={Boolean(formErrors.timeseries)}
            optional={
              meta?.loc_id === undefined && !formErrors.timeseries ? (
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
            await validateLocationStep();
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
