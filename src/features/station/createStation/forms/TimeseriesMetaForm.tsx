import React, {useEffect} from 'react';
import useCreateStationContext from '../api/useCreateStationContext';
import useTimeseriesForm from '../../api/useTimeseriesForm';
import {Grid2} from '@mui/material';
import StamdataTimeseries from '../../components/stamdata/StamdataTimeseries';
import useBreakpoints from '~/hooks/useBreakpoints';
import {FormProvider} from 'react-hook-form';
import {TimeseriesMeta} from '~/helpers/CreateStationContextProvider';
import {TimeseriesController} from '../controller/types';

type TimeseriesMetaFormProps = {
  onValidChange: (isValid: boolean, value?: TimeseriesMeta) => void;
  controller: TimeseriesController;
};

const TimeseriesMetaForm = ({onValidChange, controller}: TimeseriesMetaFormProps) => {
  const {meta} = useCreateStationContext();
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      defaultValues: controller.getValues()['meta'],
      context: {
        loctype_id: meta?.loctype_id,
      },
    },
    mode: 'Add',
  });

  const {
    formState: {isValid, isValidating},
    getValues,
    trigger,
  } = timeseriesFormMethods;

  useEffect(() => {
    controller.registerSlice('meta', true, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, []);

  useEffect(() => {
    if (!isValidating) {
      onValidChange(isValid, getValues());
    }
  }, [isValid, isValidating]);

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
