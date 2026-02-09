import PersonAddIcon from '@mui/icons-material/PersonAdd';
import {Box} from '@mui/material';
import React, {useState} from 'react';
import {FormProvider} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import {initialContactData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import ContactInfoTable from '~/features/stamdata/components/stationDetails/contacts/ContactInfoTable';
import AddContactInfo from '~/features/stamdata/components/stationDetails/contacts/AddtContactInfo';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import {useAppContext} from '~/state/contexts';
import useContactForm from './api/useContactForm';

const ContactInfo = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const {location_permissions} = usePermissions(loc_id);

  const {
    features: {contacts},
  } = useUser();

  const contactFormMethods = useContactForm({
    defaultValues: initialContactData,
    mode: 'edit',
  });

  const {reset} = contactFormMethods;

  return (
    <>
      <StationPageBoxLayout>
        <FormProvider {...contactFormMethods}>
          {openContactInfoDialog && (
            <AddContactInfo
              open={openContactInfoDialog}
              setOpen={setOpenContactInfoDialog}
              loc_id={loc_id}
            />
          )}
          <ContactInfoTable loc_id={loc_id} />
        </FormProvider>
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
          <UpdateProgressButton progressKey="kontakter" loc_id={loc_id} ts_id={-1} alterStyle />
          <FabWrapper
            icon={<PersonAddIcon />}
            text="Tilføj kontakt"
            disabled={!contacts || location_permissions !== 'edit'}
            onClick={() => {
              reset(initialContactData);
              setOpenContactInfoDialog(true);
            }}
            sx={{visibility: openContactInfoDialog ? 'hidden' : 'visible', ml: 0}}
          />
        </Box>
      </StationPageBoxLayout>
    </>
  );
};

export default ContactInfo;
