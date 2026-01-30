import React from 'react';
import FormStepButtons from './FormStepButtons';

import TimeseriesList from '../helper/TimeseriesList';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
};

const TimeseriesStep = ({activeStep, setActiveStep}: Props) => {
  const submitters = useCreateStationStore((state) => state.submitters);

  return (
    <>
      {activeStep === 1 && (
        <>
          <TimeseriesList />
          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'timeseries'}
            onFormIsValid={async () => {
              const valid = (
                await Promise.all(Object.values(submitters).map(async (cb) => await cb()))
              ).every(Boolean);

              return valid;
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
