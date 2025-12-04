import {Box, Grid2, Typography} from '@mui/material';
import React, {useEffect, useState} from 'react';
import ContactForm from '~/features/stamdata/components/stationDetails/contacts/ContactForm';
import LocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessForm';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import {useQuery} from '@tanstack/react-query';
import dayjs from 'dayjs';
import {FormProvider} from 'react-hook-form';
import {apiClient} from '~/apiClient';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';
import JupiterDmpSync from '~/features/synchronization/components/JupiterDmpSync';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {
  LastJupiterMPAPI,
  LastJupiterMPData,
} from '~/pages/field/boreholeno/components/LastJupiterMP';
import useWatlevmpForm from '../../api/useWatlevmpForm';
import DefaultWatlevmpForm from '../../components/stamdata/stamdataComponents/DefaultWatlevmpForm';
import StamdataWatlevmp from '../../components/stamdata/StamdataWatlevmp';
import {Watlevmp, watlevmpAddSchema} from '../../schema';
import useBreakpoints from '~/hooks/useBreakpoints';

const AdditionalStep = () => {
  const [helperText, setHelperText] = useState('');
  const {isMobile} = useBreakpoints();
  const size = isMobile ? 12 : 6;
  const {
    meta,
    formState: {contacts, location_access, sync},
    activeStep,
    setFormErrors,
    onValidate,
  } = useCreateStationContext();

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
    if (meta?.tstype_id === 1) {
      const watlevmpInvalid = Object.keys(watlevmpFormState.errors).length > 0;
      setFormErrors((prev) => ({
        ...prev,
        timeseries: watlevmpInvalid,
      }));
    }
  }, [watlevmpFormState.errors]);

  return (
    <>
      {activeStep === 3 && (
        <Box display={'flex'} flexDirection={'column'} gap={1.5}>
          <Typography variant="h6" marginTop={2} fontWeight={'bold'} marginBottom={1}>
            Valgfri felter
          </Typography>

          <Typography variant="subtitle1" fontWeight={'bold'}>
            Kontakter
          </Typography>
          <ContactForm loc_id={meta?.loc_id} mode={'add'} defaultContacts={contacts} />

          <Typography variant="subtitle1" fontWeight={'bold'}>
            Adgangsnøgler
          </Typography>
          <LocationAccessForm
            loc_id={meta?.loc_id}
            mode={'add'}
            defaultLocationAccess={location_access}
          />
          {meta?.tstype_id === 1 && (
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
                values={sync}
              />
            </Box>
          )}

          <FormStepButtons
            key={'timeseries'}
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
                  watlevmp: Object.keys(watlevmpFormState.errors).length > 0,
                }));
              }

              await handleControlsSubmit(
                (data) => {
                  if (Object.values(data).some((value) => value !== null && value !== undefined)) {
                    onValidate('control_settings', {
                      controls_per_year: data.controls_per_year,
                      lead_time: data.lead_time,
                    });
                  }
                },
                (e) => {
                  onValidate('control_settings', null);
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
        </Box>
      )}
    </>
  );
};

export default AdditionalStep;
