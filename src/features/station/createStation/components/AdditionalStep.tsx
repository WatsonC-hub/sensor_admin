import {Box, Typography} from '@mui/material';
import React from 'react';
import ContactForm from '~/features/stamdata/components/stationDetails/contacts/ContactForm';
import LocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessForm';
import useCreateStationContext from '../api/useCreateStationContext';
import FormStepButtons from './FormStepButtons';

import Huskeliste from '~/features/stamdata/components/stationDetails/ressourcer/Huskeliste';

const AdditionalStep = () => {
  const {
    meta,
    formState: {contacts, location_access},
    activeStep,
    onValidate,
  } = useCreateStationContext();

  return (
    <>
      {activeStep === 2 && (
        <Box display={'flex'} flexDirection={'column'} gap={1.5}>
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
              const isValid = true;

              return isValid;
            }}
          />
        </Box>
      )}
    </>
  );
};

export default AdditionalStep;
