import {Box, Typography} from '@mui/material';
import React from 'react';
import ContactForm from '~/features/stamdata/components/stationDetails/contacts/ContactForm';
import LocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessForm';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';
import {FormProvider} from 'react-hook-form';
import useControlSettingsForm, {
  ControlSettingsFormValues,
} from '~/features/configuration/api/useControlSettingsForm';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import CreateControlSettings from '~/features/configuration/components/CreateControlSettings';

import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';

const AdditionalStep = () => {
  const {
    meta,
    formState: {contacts, location_access},
    activeStep,
    setFormErrors,
    onValidate,
  } = useCreateStationContext();

  const controlSettingsFormMethods = useControlSettingsForm<ControlSettingsFormValues>({
    defaultValues: {
      controls_per_year: null,
      selectValue: 1,
      dummy: null,
      lead_time: null,
      from_unit: false,
    },
    mode: 'add',
  });

  const {handleSubmit: handleControlsSubmit} = controlSettingsFormMethods;

  return (
    <>
      {activeStep === 2 && (
        <Box display={'flex'} flexDirection={'column'} gap={1.5}>
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

          {/* {meta?.loctype_id !== undefined && meta?.tstype_id !== undefined && (
            <Box>
              <JupiterDmpSync
                loctype_id={meta.loctype_id}
                tstype_id={meta.tstype_id}
                mode="add"
                onValidate={onValidate}
                values={sync}
              />
            </Box>
          )} */}

          {meta?.loc_id === undefined && (
            <>
              <Typography variant="subtitle1" fontWeight={'bold'}>
                Kontakter
              </Typography>
              <ContactForm mode={'add'} defaultContacts={contacts} />
              <Typography variant="subtitle1" fontWeight={'bold'}>
                Adgangsnøgler
              </Typography>
              <LocationAccessForm mode={'add'} defaultLocationAccess={location_access} />
              <Typography variant="subtitle1" fontWeight={'bold'}>
                Ressourcer
              </Typography>
              <Huskeliste
                onValidate={(ressourcer) => {
                  onValidate('ressources', ressourcer);
                }}
              />
            </>
          )}

          <FormStepButtons
            key={'additional'}
            onFormIsValid={async () => {
              let isValid = true;
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
