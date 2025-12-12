import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import KeyIcon from '@mui/icons-material/Key';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider} from '@mui/material';
import React, {useState} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';

import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import {initialLocationAccessData} from '~/consts';
import {useUser} from '~/features/auth/useUser';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import LocationAccessTable from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessTable';
import SelectLocationAccess from '~/features/stamdata/components/stationDetails/locationAccessKeys/SelectLocationAccess';
import {
  adgangsforhold,
  AdgangsForhold,
} from '~/features/stamdata/components/stationDetails/zodSchemas';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {useStationProgress} from '~/hooks/query/stationProgress';
import {useAppContext} from '~/state/contexts';
import {Access, AccessTable} from '~/types';

const LocationAccess = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const [createNew, setCreateNew] = useState<boolean>(false);

  const {hasAssessed, needsProgress} = useStationProgress(loc_id, 'adgangsforhold');
  const {
    features: {keys: accessKeys},
  } = useUser();
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';
  const {
    post: postLocationAccess,
    put: editLocationAccess,
    del: delLocationAccess,
  } = useLocationAccess(loc_id);

  const formMethods = useForm({
    resolver: zodResolver(adgangsforhold),
    defaultValues: initialLocationAccessData,
    mode: 'onSubmit',
  });

  const {clearErrors, handleSubmit, reset} = formMethods;

  const handleClose = () => {
    reset(initialLocationAccessData);
    clearErrors();
    setOpenDialog(false);
    setCreateNew(false);
  };

  const handleSave: SubmitHandler<AdgangsForhold> = async (values) => {
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
          <LocationAccessTable editLocationAccess={handleEdit} delLocationAccess={handleDelete} />
          {openDialog && (
            <Dialog
              open={openDialog}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
              fullWidth
            >
              <DialogTitle id="form-dialog-title">Vælg nøgle eller kode</DialogTitle>
              <DialogContent>
                <SelectLocationAccess
                  loc_id={loc_id}
                  createNew={createNew}
                  setCreateNew={setCreateNew}
                />
                <Divider sx={{bgcolor: 'primary.main', paddingTop: 0.1, paddingBottom: 0.1}} />
                <LocationAccessFormDialog
                  loc_id={loc_id}
                  createNew={createNew}
                  setCreateNew={setCreateNew}
                />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} bttype="tertiary">
                  Annuller
                </Button>
                <Button
                  onClick={handleSubmit(handleSave, (error) => console.log(error))}
                  bttype="primary"
                  startIcon={<Save />}
                >
                  Gem
                </Button>
              </DialogActions>
            </Dialog>
          )}
        </FormProvider>
      </StationPageBoxLayout>
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={2} mt={2}>
        {needsProgress && (
          <Button bttype="primary" onClick={hasAssessed}>
            Håndteret
          </Button>
        )}
        <FabWrapper
          icon={<KeyIcon />}
          text="Tilføj nøgle eller kode"
          disabled={!accessKeys || disabled}
          onClick={() => setOpenDialog(true)}
          sx={{visibility: openDialog ? 'hidden' : 'visible', ml: 1}}
        />
      </Box>
    </>
  );
};
export default LocationAccess;
