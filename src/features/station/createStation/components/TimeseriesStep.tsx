import {Grid2} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {FormProvider} from 'react-hook-form';
import useBreakpoints from '~/hooks/useBreakpoints';
import useTimeseriesForm from '../../api/useTimeseriesForm';
import DefaultWatlevmpForm from '../../components/stamdata/stamdataComponents/DefaultWatlevmpForm';
import StamdataTimeseries from '../../components/stamdata/StamdataTimeseries';
import StamdataWatlevmp from '../../components/stamdata/StamdataWatlevmp';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import useWatlevmpForm from '../../api/useWatlevmpForm';
import {Watlevmp, watlevmpAddSchema} from '../../schema';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {apiClient} from '~/apiClient';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {
  LastJupiterMPAPI,
  LastJupiterMPData,
} from '~/pages/field/boreholeno/components/LastJupiterMP';

const TimeseriesStep = () => {
  const [helperText, setHelperText] = useState('');
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {meta, setMeta, onValidate, setFormErrors, activeStep} = useCreateStationContext();
  const [timeseriesFormMethods, TimeseriesForm] = useTimeseriesForm({
    formProps: {
      context: {
        loctype_id: meta?.loctype_id,
      },
    },
    mode: 'Add',
  });

  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.lastMP(meta?.boreholeno, meta?.intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<LastJupiterMPAPI>(
        `/sensor_field/borehole/last_mp/${meta?.boreholeno}/${meta?.intakeno}`
      );
      return {
        descriptio: data.descriptio,
        elevation: data.elevation,
        startdate: dayjs(data.startdate),
      } as LastJupiterMPData;
    },
    enabled: !!meta?.boreholeno && !!meta?.intakeno && meta?.intakeno !== undefined,
  });

  const {handleSubmit: handleTimeseriesSubmit, formState: timeseriesFormState} =
    timeseriesFormMethods;

  const watlevmpFormMethods = useWatlevmpForm<Watlevmp>({
    schema: watlevmpAddSchema,
    defaultValues: {},
  });

  const {
    handleSubmit: handleWatlevmpSubmit,
    reset: resetWatlevmp,
    formState: watlevmpFormState,
  } = watlevmpFormMethods;

  useEffect(() => {
    if (meta?.intakeno !== -1 && watlevmp !== undefined) {
      resetWatlevmp({
        elevation: watlevmp.elevation,
        description: watlevmp.descriptio,
      });
      setHelperText('Målepuntsværdien er hentet fra Jupiter');
    } else {
      setHelperText('');
    }
  }, [watlevmp, meta?.intakeno, meta?.tstype_id, meta?.boreholeno]);

  useEffect(() => {
    const timeseriesInvalid = Object.keys(timeseriesFormState.errors).length > 0;
    setFormErrors((prev) => ({
      ...prev,
      timeseries: timeseriesInvalid,
    }));

    if (meta?.tstype_id === 1) {
      const watlevmpInvalid = Object.keys(watlevmpFormState.errors).length > 0;
      setFormErrors((prev) => ({
        ...prev,
        timeseries: watlevmpInvalid || timeseriesInvalid,
      }));
    }
  }, [timeseriesFormState.errors, watlevmpFormState.errors]);

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
                  slotProps={{
                    TypeSelect: {
                      onChangeCallback: (event) => {
                        const value = (
                          event as React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
                        ).target.value;
                        setMeta((prev) => ({...prev, tstype_id: parseInt(value)}));
                      },
                    },
                  }}
                />
                <Grid2 size={size} display={'flex'} flexDirection={'row'} gap={2}>
                  <FormProvider {...watlevmpFormMethods}>
                    <StamdataWatlevmp key={meta?.tstype_id} tstype_id={meta?.tstype_id}>
                      <DefaultWatlevmpForm key={meta?.tstype_id} helperText={helperText} />
                    </StamdataWatlevmp>
                  </FormProvider>
                </Grid2>
              </Grid2>
            </StamdataTimeseries>
          </FormProvider>
          <FormStepButtons
            onFormIsValid={async () => {
              let isValid = true;
              if (meta?.tstype_id === 1) {
                await handleWatlevmpSubmit(
                  (data) => {
                    onValidate('watlevmp', data);
                  },
                  (e) => {
                    console.log(e);
                    onValidate('watlevmp', null);
                    setFormErrors((prev) => ({
                      ...prev,
                      timeseries: Object.keys(e).length > 0,
                    }));

                    isValid = Object.keys(e).length === 0;
                  }
                )();
              }
              await handleTimeseriesSubmit(
                (data) => {
                  onValidate('timeseries', data);
                },
                (e) => {
                  console.log(e);
                  onValidate('timeseries', null);
                  setFormErrors({
                    timeseries: Object.keys(e).length > 0,
                  });

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
