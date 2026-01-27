import React, {useEffect, useState} from 'react';

import FormStepButtons from './FormStepButtons';
import {LocationManager} from '../controller/LocationManager';
import LocationEditor from '../helper/LocationEditor';

type Props = {
  locationManager: LocationManager;
  activeStep: number;
  setActiveStep: (step: number) => void;
  defaultState?: Partial<Record<string, any>>;
};

const LocationStep = ({locationManager, activeStep, setActiveStep}: Props) => {
  const [, setTick] = useState(0);

  // subscribe to manager changes
  useEffect(() => {
    const unsubscribe = locationManager?.onChange(() => {
      setTick((x) => x + 1);
    });

    return () => {
      unsubscribe?.();
    }; // ✅ cleanup
  }, [locationManager]);

  return (
    <>
      {activeStep === 0 && (
        <>
          <LocationEditor manager={locationManager} />
          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'location'}
            onFormIsValid={async () => {
              const isValid = await locationManager?.get()?.getController().validateAllSlices();

              return isValid ?? false;
            }}
          />
        </>
      )}
    </>
  );
};

export default LocationStep;
