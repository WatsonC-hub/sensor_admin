import {Stepper, Step, StepLabel, Typography} from '@mui/material';
import React from 'react';

type Props = {
  activeStep: number;
  loc_id?: number;
};

const FormSteps = ({activeStep, loc_id}: Props) => {
  return (
    <Stepper activeStep={activeStep} alternativeLabel>
      {loc_id === undefined && (
        <Step key={'lokation'} completed={activeStep > 0} active={activeStep === 0}>
          <StepLabel optional={<Typography variant="caption">Obligatorisk</Typography>}>
            <Typography variant="body1">Lokation</Typography>
          </StepLabel>
        </Step>
      )}
      <Step key={'tidsserie'} completed={activeStep > 1} active={activeStep === 1}>
        <StepLabel
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
      </Step>
      <Step key={'additional'} active={activeStep === 2}>
        <StepLabel optional={<Typography variant="caption">Valgfrit</Typography>}>
          <Typography variant="body1">Yderligere oplysninger</Typography>
        </StepLabel>
      </Step>
    </Stepper>
  );
};

export default FormSteps;
