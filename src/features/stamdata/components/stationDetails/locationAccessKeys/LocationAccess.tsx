import KeyIcon from '@mui/icons-material/Key';
import {Box} from '@mui/material';
import React, {useState} from 'react';
import type {SubmitHandler} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import {initialLocationAccessData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import LocationAccessTable from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessTable';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import {useAppContext} from '~/state/contexts';
import useLocationAccessForm, {locationAccessSchema} from './api/useLocationAccessForm';
import type {Access} from '~/types';
import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import {createTypedForm} from '~/components/formComponents/Form';
import type {z} from 'zod';

export type FormOutput = z.output<typeof locationAccessSchema>;
export type FormInput = z.input<typeof locationAccessSchema>;
const Form = createTypedForm<FormInput, FormOutput>();

const LocationAccess = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const {
    features: {keys: accessKeys},
  } = useUser();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const formMethods = useLocationAccessForm<typeof locationAccessSchema>({
    schema: locationAccessSchema,
    defaultValues: initialLocationAccessData,
  });

  const {reset} = formMethods;
  const {
    post: {mutateAsync: postLocationAccessAsync},
  } = useLocationAccess(loc_id);

  const handleSave: SubmitHandler<FormOutput> = async (values) => {
    const test: Access = {
      id: values.id ?? -1,
      navn: values.navn,
      type: values.type,
      contact_id: values.contact_id,
      kommentar: values.kommentar,
      placering: values.placering ?? '',
      koden: values.koden ?? '',
    };
    const payload = {
      path: `${loc_id}`,
      data: test,
    };
    await postLocationAccessAsync(payload);

    reset();
    setOpenDialog(false);
  };

  return (
    <>
      <StationPageBoxLayout>
        <Form formMethods={formMethods}>
          <LocationAccessTable loc_id={loc_id} Form={Form} />
          {openDialog && (
            <LocationAccessFormDialog
              loc_id={loc_id}
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
              handleSave={async (data) => await handleSave(data)}
              Form={Form}
            />
          )}
        </Form>
        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center',
            gap: 1,
          }}
        >
          <UpdateProgressButton
            loc_id={loc_id}
            ts_id={-1}
            progressKey="adgangsforhold"
            alterStyle
          />
          <FabWrapper
            icon={<KeyIcon />}
            text="Tilføj nøgle eller kode"
            disabled={!accessKeys || disabled}
            onClick={() => setOpenDialog(true)}
            sx={{visibility: openDialog ? 'hidden' : 'visible', ml: 0}}
          />
        </Box>
      </StationPageBoxLayout>
    </>
  );
};
export default LocationAccess;
