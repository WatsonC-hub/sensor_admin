import {zodResolver} from '@hookform/resolvers/zod';
import {Save} from '@mui/icons-material';
import KeyIcon from '@mui/icons-material/Key';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid} from '@mui/material';
import React, {useEffect, useState} from 'react';
import {FormProvider, SubmitHandler, useForm} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import {initialLocationAccessData} from '~/consts';
import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import useBreakpoints from '~/hooks/useBreakpoints';
import {Access, AccessTable} from '~/types';

import {adgangsforhold} from '../zodSchemas';
import type {AdgangsForhold} from '../zodSchemas';

import LocationAccessFormDialog from './LocationAccessFormDialog';
import LocationAccessTable from './LocationAccessTable';
import SelectLocationAccess from './SelectLocationAccess';

const LocationAccess = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const {isTablet} = useBreakpoints();
  const params = useParams();
  const loc_id = parseInt(params.locid!);
  const [createNew, setCreateNew] = useState<boolean>(false);

  const {
    get: {data: locationAccess},
    post: postLocationAccess,
    put: editLocationAccess,
    del: delLocationAccess,
  } = useLocationAccess(parseInt(params.locid!));

  const formMethods = useForm({
    resolver: zodResolver(adgangsforhold),
    defaultValues: initialLocationAccessData,
    mode: 'onSubmit',
  });

  const {clearErrors, handleSubmit, reset, watch} = formMethods;

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

  const id = watch('id');

  useEffect(() => {
    if (id) {
      console.log(id);
      setCreateNew(true);
    } else {
      setCreateNew(false);
    }
  }, [id]);

  return (
    <Grid container spacing={1} my={1} justifyContent="center" alignItems="center">
      <FormProvider {...formMethods}>
        {loc_id && (
          <>
            <Grid item xs={12} md={12} sm={12}>
              <Box>
                <Button
                  size="small"
                  color="primary"
                  bttype="primary"
                  sx={isTablet ? {ml: 1} : {textTransform: 'none', ml: '12px'}}
                  startIcon={<KeyIcon />}
                  onClick={() => setOpenDialog(true)}
                >
                  Tilføj nøgle eller kode
                </Button>
              </Box>
            </Grid>

            <Grid item xs={12} sm={12}>
              <LocationAccessTable
                data={locationAccess}
                editLocationAccess={handleEdit}
                delLocationAccess={handleDelete}
              />
            </Grid>
            <Grid item xs={12} sm={12}>
              {openDialog && (
                <Dialog
                  open={openDialog}
                  onClose={handleClose}
                  aria-labelledby="form-dialog-title"
                  fullWidth
                >
                  <DialogTitle id="form-dialog-title">Vælg nøgle eller kode</DialogTitle>
                  <DialogContent>
                    <SelectLocationAccess loc_id={loc_id} />
                    <Grid item my={1}>
                      <Divider
                        sx={{bgcolor: 'primary.main', paddingTop: 0.1, paddingBottom: 0.1}}
                      />
                    </Grid>
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
            </Grid>
          </>
        )}
      </FormProvider>
    </Grid>
  );
};
export default LocationAccess;
