import React, {useEffect} from 'react';
import FormStepButtons from './FormStepButtons';

import TimeseriesList from '../helper/TimeseriesList';
import {TimeseriesManager} from '../controller/TimeseriesManager';
import {CreateStationPayload} from '../controller/types';
import {AggregateController} from '../controller/AggregateController';
import {useCreateStationStore} from '../state/useCreateStationStore';

type Props = {
  timeseriesManager: TimeseriesManager;
  RootController: AggregateController<CreateStationPayload>;
  activeStep: number;
  setActiveStep: (step: number) => void;
};

const TimeseriesStep = ({timeseriesManager, RootController, activeStep, setActiveStep}: Props) => {
  useEffect(() => {
    return () => {
      // Cleanup on unmount
      timeseriesManager.clear();
    };
  }, []);

  const submitters = useCreateStationStore((state) => state.submitters);

  return (
    <>
      {activeStep === 1 && (
        <>
          <TimeseriesList manager={timeseriesManager} />
          <FormStepButtons
            activeStep={activeStep}
            setActiveStep={setActiveStep}
            key={'timeseries'}
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

export default TimeseriesStep;
