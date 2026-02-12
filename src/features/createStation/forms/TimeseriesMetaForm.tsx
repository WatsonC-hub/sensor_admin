import React, {useEffect} from 'react';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import {Grid2} from '@mui/material';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import useBreakpoints from '~/hooks/useBreakpoints';
import {FormProvider} from 'react-hook-form';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {TimeseriesMeta} from '../types';

type TimeseriesMetaFormProps = {
  uuid: string;
  setTstype: (tstype_id: number) => void;
  setIntakeno: (intakeno: number) => void;
  setValues: (values: TimeseriesMeta) => void;
};

const TimeseriesMetaForm = ({uuid, setValues, setTstype, setIntakeno}: TimeseriesMetaFormProps) => {
  const [timeseries, locationMeta, registerSubmitter, removeSubmitter] = useCreateStationStore(
    (state) => [
      state.formState.timeseries?.[uuid],
      state.formState.location?.meta,
      state.registerSubmitter,
      state.removeSubmitter,
    ]
  );

  const id = `timeseries.${uuid}.meta`;
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      defaultValues: timeseries?.['meta'],
      context: {
        loctype_id: locationMeta?.loctype_id,
      },
    },
    mode: 'Add',
  });

  const {handleSubmit, watch} = timeseriesFormMethods;

  const tstype_id = watch('tstype_id');
  const intakeno = watch('intakeno');

  useEffect(() => {
    if (tstype_id !== timeseries?.meta?.tstype_id) setTstype(tstype_id);
  }, [tstype_id]);

  useEffect(() => {
    if (intakeno !== timeseries?.meta?.intakeno && intakeno !== undefined) {
      setIntakeno(intakeno);
    }
  }, [intakeno]);

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid: boolean = false;
      await handleSubmit((values) => {
        setValues(values);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  return (
    <FormProvider {...timeseriesFormMethods}>
      <StamdataTimeseries boreholeno={locationMeta?.boreholeno}>
        <Grid2 container size={12} spacing={1}>
          <TimeseriesForm size={size} loc_name={locationMeta?.loc_name} required />
        </Grid2>
      </StamdataTimeseries>
    </FormProvider>
  );
};

export default TimeseriesMetaForm;
