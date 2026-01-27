import React, {useEffect} from 'react';
import FormStepButtons from './FormStepButtons';

import TimeseriesList from '../helper/TimeseriesList';
import {TimeseriesManager} from '../controller/TimeseriesManager';
import {RootPayload} from '../controller/types';
import {AggregateController} from '../controller/AggregateController';

type Props = {
  timeseriesManager: TimeseriesManager;
  RootController: AggregateController<RootPayload>;
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
              const isValid = timeseriesManager
                ?.list()
                .map(async (item) => await item.agg.getController().validateAllSlices())
                .every((v) => v);

              console.log('RootController values', RootController.getValues());
              return isValid ?? false;
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
