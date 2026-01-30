import React from 'react';

import FormStepButtons from './FormStepButtons';
import {useCreateStationStore} from '../state/useCreateStationStore';
import LocationForm from '../forms/LocationForm';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
};

const LocationStep = ({activeStep, setActiveStep}: Props) => {
  const submitters = useCreateStationStore((state) => state.submitters);

  return (
    <>
      {activeStep === 0 && (
        <>
          <LocationForm />
          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'location'}
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

export default LocationStep;
