import {Box, Grid2, Typography} from '@mui/material';
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
import ControlSettings from '~/features/configuration/components/ControlSettings';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import CreateControlSettings from '../../../configuration/components/CreateControlSettings';
import JupiterDmpSync from '~/features/synchronization/components/JupiterDmpSync';

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
    watch,
  } = watlevmpFormMethods;

  const elevation = watch('elevation');

  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsFormValues>({
    defaultValues: {
      controls_per_year: null,
      selectValue: 1,
      dummy: null,
      lead_time: null,
    },
    mode: 'add',
  });

  const {handleSubmit: handleControlsSubmit} = controlSettingsFormMethods;

  useEffect(() => {
    if (meta?.intakeno !== undefined && watlevmp !== undefined) {
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
    if (meta?.tstype_id !== 1 || elevation !== watlevmp?.elevation) {
      setHelperText('');
    }
  }, [meta?.tstype_id, elevation]);

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
            onFormIsValid={async () => {
              let isValid = true;
              if (meta?.tstype_id === 1) {
                await handleWatlevmpSubmit(
                  (data) => {
                    if (
                      Object.values(data).some((value) => value !== null && value !== undefined)
                    ) {
                      onValidate('watlevmp', data);
                    }
                  },
                  (e) => {
                    onValidate('watlevmp', null);
                    setFormErrors((prev) => ({
                      ...prev,
                      timeseries: Object.keys(e).length > 0,
                    }));

                    isValid = Object.keys(e).length === 0;
                  }
                )();
              } else {
                onValidate('watlevmp', null);
                setFormErrors((prev) => ({
                  ...prev,
                  timeseries: Object.keys(timeseriesFormState.errors).length > 0,
                }));
              }
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

              await handleControlsSubmit(
                (data) => {
                  if (Object.values(data).some((value) => value !== null && value !== undefined)) {
                    onValidate('controlSettings', {
                      controls_per_year: data.controls_per_year,
                      lead_time: data.lead_time,
                    });
                  }
                },
                (e) => {
                  onValidate('controlSettings', null);
                  setFormErrors((prev) => ({
                    ...prev,
                    controlSettings: Object.keys(e).length > 0,
                  }));

                  isValid = Object.keys(e).length === 0;
                }
              )();

              return isValid;
            }}
          />
          <Box display={'flex'} flexDirection={'column'} gap={1.5}>
            <Typography variant="h6" marginTop={2} fontWeight={'bold'} marginBottom={1}>
              Valgfri felter
            </Typography>

            {meta?.tstype_id === 1 && activeStep === 1 && (
              <Box>
                <Typography variant="subtitle1" marginBottom={1}>
                  Målepunkt
                </Typography>
                <Grid2 container size={size} spacing={1} marginBottom={2}>
                  <FormProvider {...watlevmpFormMethods}>
                    <StamdataWatlevmp tstype_id={meta?.tstype_id}>
                      <DefaultWatlevmpForm helperText={helperText} />
                    </StamdataWatlevmp>
                  </FormProvider>
                </Grid2>
              </Box>
            )}

            <Box>
              <Typography variant="subtitle1" marginBottom={1}>
                Kontrolhyppighed
              </Typography>
              <FormProvider {...controlSettingsFormMethods}>
                <ControlSettings>
                  <CreateControlSettings />
                </ControlSettings>
              </FormProvider>
            </Box>

            {meta?.loctype_id !== undefined && meta?.tstype_id !== undefined && (
              <Box>
                <JupiterDmpSync
                  loctype_id={meta.loctype_id}
                  tstype_id={meta.tstype_id}
                  mode="add"
                  onValidate={onValidate}
                />
              </Box>
            )}
          </Box>
        </>
      )}
    </>
  );
};

export default TimeseriesStep;
