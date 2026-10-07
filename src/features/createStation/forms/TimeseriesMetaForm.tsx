import {Grid} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {FormProvider} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import useTimeseriesForm from '~/features/station/api/useTimeseriesForm';
import StamdataTimeseries from '~/features/station/components/stamdata/StamdataTimeseries';
import {queryKeys} from '~/helpers/queryKeyFactoryHelper';
import useBreakpoints from '~/hooks/useBreakpoints';

import {useCreateStationStore} from '../state/useCreateStationStore';

import type {TimeseriesMeta} from '../types';

type TimeseriesMetaFormProps = {
  uuid: string;
  setTstype: (tstype_id: number) => void;
  setIntakeno: (intakeno: number) => void;
  setValues: (values: TimeseriesMeta) => void;
};

const TimeseriesMetaForm = ({uuid, setValues, setTstype, setIntakeno}: TimeseriesMetaFormProps) => {
  const [timeseries, locationMeta, registerSubmitter, removeSubmitter, uniqueTimeseriesError] =
    useCreateStationStore((state) => [
      state.formState.timeseries?.[uuid],
      state.formState.location?.meta,
      state.registerSubmitter,
      state.removeSubmitter,
      state.uniqueTimeseriesError,
    ]);

  const id = `timeseries.${uuid}.meta`;
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const hasUniqueTimeseriesError = Boolean(uniqueTimeseriesError?.[uuid]);
  const duplicateField = locationMeta?.boreholeno ? 'intakeno' : 'prefix';

  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    defaultValues: timeseries?.['meta'],
    context: {
      loctype_id: locationMeta?.loctype_id,
    },
    mode: 'Add',
  });

  const {data: intake_list} = useQuery({
    queryKey: queryKeys.Borehole.intakeList(locationMeta?.boreholeno),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<{intakeno: number}>>(
        `/sensor_field/intake_list/${locationMeta?.boreholeno}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: locationMeta?.boreholeno !== undefined && locationMeta?.boreholeno !== null,
  });

  const {
    handleSubmit,
    watch,
    setError,
    clearErrors,
    setValue,
    formState: {errors},
  } = timeseriesFormMethods;

  const tstype_id = watch('tstype_id');
  const intakeno = watch('intakeno');

  useEffect(() => {
    if (hasUniqueTimeseriesError) {
      setError(duplicateField, {
        type: 'duplicate',
        message: `Kombination af ${duplicateField === 'intakeno' ? 'indtag' : 'navn'} og tidsserietype findes allerede`,
      });
    } else {
      clearErrors(duplicateField);
    }
  }, [hasUniqueTimeseriesError, duplicateField, setError, clearErrors, errors]);

  useEffect(() => {
    if (tstype_id !== timeseries?.meta?.tstype_id) setTstype(tstype_id);
  }, [tstype_id]);

  useEffect(() => {
    if (intakeno !== timeseries?.meta?.intakeno && intakeno !== undefined) {
      setIntakeno(intakeno);
    }
  }, [intakeno]);

  useEffect(() => {
    if (intake_list && intake_list.length === 1) setValue('intakeno', intake_list[0].intakeno);
  }, [intake_list, setValue]);

  useEffect(() => {
    registerSubmitter(id, async () => {
      let valid = false;
      await handleSubmit((values) => {
        if (locationMeta?.boreholeno) delete values.prefix;

        setValues(values as TimeseriesMeta);
        valid = true;
      })();
      return valid;
    });

    return () => removeSubmitter(id);
  }, [handleSubmit]);

  return (
    <FormProvider {...timeseriesFormMethods}>
      <StamdataTimeseries boreholeno={locationMeta?.boreholeno}>
        <Grid container size={12} spacing={1}>
          <TimeseriesForm size={size} loc_name={locationMeta?.loc_name} required />
        </Grid>
      </StamdataTimeseries>
    </FormProvider>
  );
};

export default TimeseriesMetaForm;
