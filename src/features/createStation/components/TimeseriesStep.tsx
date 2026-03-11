import React from 'react';
import FormStepButtons from './FormStepButtons';

import TimeseriesList from '../helper/TimeseriesList';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {Typography} from '@mui/material';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  loc_id?: number;
};

const TimeseriesStep = ({activeStep, setActiveStep, loc_id}: Props) => {
  const validateSubmitters = useCreateStationStore((state) => state.validateSubmitters);

  return (
    <>
      {activeStep === 1 && (
        <>
          <Typography variant="caption" alignContent={'center'}>
            Felter markeret med en stjerne (*) er obligatoriske.
          </Typography>
          <TimeseriesList />
          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'timeseries'}
            loc_id={loc_id}
            onFormIsValid={validateSubmitters}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
