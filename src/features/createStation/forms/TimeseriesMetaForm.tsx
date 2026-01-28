import React, {useEffect} from 'react';
import useCreateStationContext from '../api/useCreateStationContext';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import {Grid2} from '@mui/material';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import useBreakpoints from '~/hooks/useBreakpoints';
import {FormProvider} from 'react-hook-form';
import {TimeseriesMeta} from '~/helpers/CreateStationContextProvider';
import {TimeseriesController} from '../controller/types';
import {useCreateStationStore} from '../state/store';

type TimeseriesMetaFormProps = {
  index: string;
  // onValidChange: (isValid: boolean, value?: TimeseriesMeta) => void;
  // controller: TimeseriesController;
};

const TimeseriesMetaForm = ({index}: TimeseriesMetaFormProps) => {
  const [timeseries, loctype_id, registerSubmitter, setState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[index],
    state.formState.location?.meta.loctype_id,
    state.registerSubmitter,
    state.setState,
  ]);

  const {meta} = useCreateStationContext();
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      defaultValues: timeseries?.['meta'],
      context: {
        loctype_id: loctype_id,
      },
    },
    mode: 'Add',
  });

  const {
    formState: {isValid, isValidating},
    getValues,
    trigger,
    handleSubmit,
    watch,
  } = timeseriesFormMethods;

  const tstype_id = watch('tstype_id');

  useEffect(() => {
    setState(`timeseries.${index}.meta.tstype_id`, tstype_id);
  }, [tstype_id]);

  useEffect(() => {
    registerSubmitter(`timeseries.${index}.meta`, async () => {
      let valid: boolean = false;
      await handleSubmit(
        (values) => {
          setState(`timeseries.${index}.meta`, values);
          valid = true;
        },
        (errors) => console.log('errors', errors)
      )();
      return valid;
    });
  }, [handleSubmit]);

  // useEffect(() => {
  //   controller.registerSlice('meta', true, async () => {
  //     const isValid = await trigger();
  //     return isValid;
  //   });
  // }, []);

  // useEffect(() => {
  //   if (!isValidating) {
  //     onValidChange(isValid, getValues());
  //   }
  // }, [isValid, isValidating]);

  return (
    <FormProvider {...timeseriesFormMethods}>
      <StamdataTimeseries boreholeno={meta?.boreholeno}>
        <Grid2 container size={12} spacing={1}>
          <TimeseriesForm size={size} loc_name={meta?.loc_name} required />
        </Grid2>
      </StamdataTimeseries>
    </FormProvider>
  );
};

export default TimeseriesMetaForm;
