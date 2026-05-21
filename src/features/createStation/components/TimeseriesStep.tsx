import React from 'react';
import FormStepButtons from './FormStepButtons';

import TimeseriesList from '../helper/TimeseriesList';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {Typography} from '@mui/material';
import {TimeseriesMeta} from '../types';

type Props = {
  activeStep: number;
  setActiveStep: (step: number) => void;
  loc_id?: number;
};

const TimeseriesStep = ({activeStep, setActiveStep, loc_id}: Props) => {
  const [validateSubmitters, setUniqueTimeseriesError] = useCreateStationStore((state) => [
    state.validateSubmitters,
    state.setUniqueTimeseriesError,
  ]);

  const handleValidateSubmitters = async () => {
    const isValid = await validateSubmitters(async (state) => {
      // Check that all timeseries have a unique combination of prefix, tstype_id and intakeno
      const combinations = new Set();
      const metas: Record<string, TimeseriesMeta> = {};
      for (const [key, ts] of Object.entries(state?.timeseries || {})) {
        const combo = `${ts?.meta?.prefix}-${ts?.meta?.tstype_id}-${ts?.meta?.intakeno}`;
        if (combinations.has(combo)) {
          if (ts.meta) {
            metas[key] = ts.meta;
          }
        }
        combinations.add(combo);
      }

      if (Object.keys(metas).length > 0) {
        setUniqueTimeseriesError(metas);
        return false;
      }

      return true;
    });
    return isValid;
  };

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
            onFormIsValid={handleValidateSubmitters}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
