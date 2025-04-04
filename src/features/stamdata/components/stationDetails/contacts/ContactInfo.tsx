import {zodResolver} from '@hookform/resolvers/zod';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import React, {useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import {initialContactData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useContactInfo} from '~/features/stamdata/api/useContactInfo';
import ContactInfoTable from '~/features/stamdata/components/stationDetails/contacts/ContactInfoTable';
import SelectContactInfo from '~/features/stamdata/components/stationDetails/contacts/SelectContactInfo';
import {contact_info} from '~/features/stamdata/components/stationDetails/zodSchemas';
import {useAppContext} from '~/state/contexts';
import {ContactTable} from '~/types';

const ContactInfo = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openContactInfoDialog, setOpenContactInfoDialog] = useState<boolean>(false);
  const {del: deleteContact, put: editContact} = useContactInfo(loc_id);
  const {location_permissions} = usePermissions(loc_id);

  const user = useUser();

  const formMethods = useForm({
    resolver: zodResolver(contact_info),
    defaultValues: initialContactData,
    mode: 'onSubmit',
  });

  const {reset} = formMethods;

  const handleDelete = (relation_id: number) => {
    const payload = {
      path: `${relation_id}`,
    };

    deleteContact.mutate(payload);
  };

  const handleEdit = (contactInfo: ContactTable) => {
    const email = contactInfo.email !== '' ? contactInfo.email : null;
    const payload = {
      path: `${loc_id}`,
      data: {
        id: contactInfo.id,
        navn: contactInfo.navn,
        telefonnummer: contactInfo.telefonnummer,
        email: email,
        contact_role: contactInfo.contact_role,
        comment: contactInfo.comment,
        org: contactInfo.org,
        user_id: contactInfo.user_id ?? null,
        relation_id: contactInfo.relation_id,
        contact_type: contactInfo.contact_type,
      },
    };

    editContact.mutate(payload, {
      onSuccess: () => {
        reset(initialContactData);
      },
    });
  };

  return (
    <>
      <FormProvider {...formMethods}>
        {openContactInfoDialog && (
          <SelectContactInfo open={openContactInfoDialog} setOpen={setOpenContactInfoDialog} />
        )}
        <ContactInfoTable delContact={handleDelete} editContact={handleEdit} />
      </FormProvider>
      <FabWrapper
        icon={<PersonAddIcon />}
        text="Tilføj kontakt"
        disabled={!user?.contactAndKeysPermission || location_permissions !== 'edit'}
        onClick={() => {
          reset();
          setOpenContactInfoDialog(true);
        }}
        sx={{visibility: openContactInfoDialog ? 'hidden' : 'visible'}}
      />
    </>
  );
};

export default ContactInfo;
