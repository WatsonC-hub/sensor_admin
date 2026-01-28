import React, {useEffect, useState} from 'react';

import FormStepButtons from './FormStepButtons';
import {LocationManager} from '../controller/LocationManager';
import LocationEditor from '../helper/LocationEditor';
import {useCreateStationStore} from '../state/store';

type Props = {
  locationManager: LocationManager;
  activeStep: number;
  setActiveStep: (step: number) => void;
  defaultState?: Partial<Record<string, any>>;
};

const LocationStep = ({locationManager, activeStep, setActiveStep}: Props) => {
  const [, setTick] = useState(0);

  const submitters = useCreateStationStore((state) => state.submitters);

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
              console.log('submitters', submitters);

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
