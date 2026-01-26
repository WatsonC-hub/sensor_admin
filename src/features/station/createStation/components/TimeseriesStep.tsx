import React, {useState} from 'react';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import UnitDialog from './UnitDialog';

import TimeseriesList from '../helper/TimeseriesList';
import {TimeseriesManager} from '../controller/TimeseriesManager';
import {AggregateController} from '../controller/AggregateController';
import {RootPayload} from '../controller/types';

type Props = {
  managerRef: React.RefObject<TimeseriesManager | undefined>;
  parentRef: React.RefObject<AggregateController<RootPayload> | undefined>;
};

const TimeseriesStep = ({managerRef, parentRef}: Props) => {
  const [unitDialog, setUnitDialog] = useState(false);
  const manager = managerRef.current;
  const {activeStep} = useCreateStationContext();

  return (
    <>
      {activeStep === 1 && (
        <>
          <TimeseriesList manager={manager} AddByUnit={() => setUnitDialog(true)} />
          <FormStepButtons
            key={'timeseries'}
            onFormIsValid={async () => {
              const isValid = await parentRef.current?.validateAllSlices();
              console.log(parentRef.current?.getSlices().timeseries?.value);
              console.log('TimeseriesStep valid:', isValid);
              return isValid || false;
            }}
          />
          <UnitDialog
            open={unitDialog}
            onClose={() => setUnitDialog(false)}
            onValidate={() => {
              // onUnitListValidate(validate_units, onValidate, timeseries, units);
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
