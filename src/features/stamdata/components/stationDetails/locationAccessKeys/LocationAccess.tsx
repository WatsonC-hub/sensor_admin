import KeyIcon from '@mui/icons-material/Key';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider} from '@mui/material';
import React, {useState} from 'react';
import {FormProvider, SubmitHandler} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import {initialLocationAccessData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import LocationAccessTable from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessTable';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import {useStationProgress} from '~/hooks/query/stationProgress';
import {useAppContext} from '~/state/contexts';
import useLocationAccessForm from './api/useLocationAccessForm';
import {Access} from '~/types';
import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';

const LocationAccess = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const [openDialog, setOpenDialog] = useState<boolean>(false);

  const {hasAssessed, needsProgress} = useStationProgress(loc_id, 'adgangsforhold', ts_id);
  const {
    features: {keys: accessKeys},
  } = useUser();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const formMethods = useLocationAccessForm({
    mode: 'edit',
    defaultValues: initialLocationAccessData,
  });

  const {reset} = formMethods;
  const {post: postLocationAccess} = useLocationAccess(loc_id);

  const handleSave: SubmitHandler<Access> = async (values) => {
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
    postLocationAccess.mutate(payload, {
      onSuccess: () => {
        reset();
        setOpenDialog(false);
        setCreateNew(false);
        if (needsProgress) hasAssessed();
      },
    });
  };

  const handleDelete = (location_access_id: number | undefined) => {
    const payload = {
      path: `${loc_id}/${location_access_id}`,
    };

    delLocationAccess.mutate(payload);
  };

  const handleEdit = async (locationAccess: AccessTable) => {
    const payload = {
      path: `${locationAccess.id}`,
      data: {
        id: locationAccess.id ?? -1,
        navn: locationAccess.navn,
        type: locationAccess.type,
        contact_id: locationAccess.contact_id,
        kommentar: locationAccess.kommentar,
        placering: locationAccess.placering ?? null,
        koden: locationAccess.koden ?? null,
      },
    };

    editLocationAccess.mutate(payload, {
      onSuccess: () => {
        reset();
      },
    });
  };

  return (
    <>
      <StationPageBoxLayout>
        <FormProvider {...formMethods}>
          <LocationAccessTable loc_id={loc_id} />
          {openDialog && (
            <LocationAccessFormDialog
              loc_id={loc_id}
              openDialog={openDialog}
              setOpenDialog={setOpenDialog}
              handleSave={handleSave}
            />
          )}
        </FormProvider>
        <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
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
