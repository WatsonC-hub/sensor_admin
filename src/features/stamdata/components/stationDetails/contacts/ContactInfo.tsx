import PersonAddIcon from '@mui/icons-material/PersonAdd';
import React, {useState} from 'react';
import {FormProvider} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import {initialContactData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import ContactInfoTable from '~/features/stamdata/components/stationDetails/contacts/ContactInfoTable';
import SelectContactInfo from '~/features/stamdata/components/stationDetails/contacts/SelectContactInfo';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
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
            <SelectContactInfo
              open={openContactInfoDialog}
              setOpen={setOpenContactInfoDialog}
              loc_id={loc_id}
            />
          )}
          <ContactInfoTable mode="edit" loc_id={loc_id} />
        </FormProvider>
      </StationPageBoxLayout>
      <FabWrapper
        icon={<PersonAddIcon />}
        text="Tilføj kontakt"
        disabled={!contacts || location_permissions !== 'edit'}
        onClick={() => {
          reset(initialContactData);
          setOpenContactInfoDialog(true);
        }}
        sx={{visibility: openContactInfoDialog ? 'hidden' : 'visible'}}
      />
    </>
  );
};

export default ContactInfo;
