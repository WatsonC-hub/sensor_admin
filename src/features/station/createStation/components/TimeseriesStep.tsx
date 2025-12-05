import {Grid2} from '@mui/material';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';
import useBreakpoints from '~/hooks/useBreakpoints';
import useTimeseriesForm from '../../api/useTimeseriesForm';
import StamdataTimeseries from '../../components/stamdata/StamdataTimeseries';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
const TimeseriesStep = () => {
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {meta, setMeta, onValidate, setFormErrors, activeStep} = useCreateStationContext();

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      context: {
        loctype_id: meta?.loctype_id,
        loc_id: meta?.loc_id,
      },
    },
    mode: 'Add',
  });

  const {handleSubmit: handleTimeseriesSubmit, formState: timeseriesFormState} =
    timeseriesFormMethods;

  useEffect(() => {
    const timeseriesInvalid = Object.keys(timeseriesFormState.errors).length > 0;
    setFormErrors((prev) => ({
      ...prev,
      timeseries: timeseriesInvalid,
    }));

    if (meta?.tstype_id === 1) {
      setFormErrors((prev) => ({
        ...prev,
        timeseries: timeseriesInvalid,
      }));
    }
  }, [timeseriesFormState.errors]);

  return (
    <>
      {activeStep === 1 && (
        <>
          <FormProvider {...timeseriesFormMethods}>
            <StamdataTimeseries boreholeno={meta?.boreholeno}>
              <Grid2 container size={12} spacing={1}>
                <TimeseriesForm
                  size={size}
                  loc_name={meta?.loc_name}
                  required={meta?.loc_id !== undefined}
                  slotProps={{
                    TypeSelect: {
                      onChangeCallback: (event) => {
                        const value = (
                          event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                        ).target.value;
                        setMeta((prev) => ({...prev, tstype_id: parseInt(value)}));
                      },
                    },
                    intakeno: {
                      onChangeCallback: (event) => {
                        const value = (
                          event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                        ).target.value;
                        setMeta((prev) => ({
                          ...prev,
                          intakeno: value === '' ? undefined : parseInt(value),
                        }));
                      },
                    },
                  }}
                />
              </Grid2>
            </StamdataTimeseries>
          </FormProvider>
          <FormStepButtons
            key={'timeseries'}
            onFormIsValid={async () => {
              let isValid = true;
              await handleTimeseriesSubmit(
                (data) => {
                  if (Object.values(data).some((value) => value !== null && value !== undefined)) {
                    onValidate('timeseries', data);
                  }
                },
                (e) => {
                  onValidate('timeseries', null);
                  setFormErrors((prev) => ({
                    ...prev,
                    timeseries: Object.keys(e).length > 0 || isValid === false,
                  }));

                  isValid = Object.keys(e).length === 0;
                }
              )();

              return isValid;
            }}
          />
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
