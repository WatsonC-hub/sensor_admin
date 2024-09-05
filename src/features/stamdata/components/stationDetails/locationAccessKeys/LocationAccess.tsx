import {Save} from '@mui/icons-material';
import KeyIcon from '@mui/icons-material/Key';
import {Box, Dialog, DialogActions, DialogContent, DialogTitle, Divider, Grid} from '@mui/material';
import React, {useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import {initialLocationAccessData} from '~/consts';
import {useLocationAccess} from '~/features/stamdata/api/useLocationAccess';
import useBreakpoints from '~/hooks/useBreakpoints';
import {Access, AccessTable} from '~/types';

import LocationAccessFormDialog from './LocationAccessFormDialog';
import LocationAccessTable from './LocationAccessTable';
import SelectLocationAccess from './SelectLocationAccess';

const LocationAccess = () => {
  const [openDialog, setOpenDialog] = useState<boolean>(false);
  const {isTablet} = useBreakpoints();
  const {setValue, clearErrors} = useFormContext();
  const params = useParams();
  const loc_id = parseInt(params.locid!);
  const {watch, trigger} = useFormContext();
  const access = watch('adgangsforhold');

  const {
    get: {data: locationAccess},
    post: postLocationAccess,
    put: editLocationAccess,
    del: delLocationAccess,
  } = useLocationAccess(parseInt(params.locid!));

  const handleClose = () => {
    setValue('adgangsforhold', initialLocationAccessData);
    clearErrors('adgangsforhold');
    setOpenDialog(false);
  };

  const handleSave = async () => {
    const result = await trigger('adgangsforhold');
    if (access && result) {
      const contact = access.contact_id;
      let id = null;
      if (typeof contact === 'string') id = contact;
      else if (typeof contact === 'object' && contact.id) id = contact.id;

      const test: Access = {
        id: access.id ?? -1,
        navn: access.navn,
        type: access.type,
        contact_id: id,
        kommentar: access.kommentar,
        placering: access.placering ?? null,
        koden: access.koden ?? null,
      };
      const payload = {
        path: `${loc_id}`,
        data: test,
      };
      postLocationAccess.mutate(payload, {
        onSuccess: () => {
          setValue('adgangsforhold', initialLocationAccessData);
        },
      });
    }
  };

  const handleDelete = (location_access_id: number | undefined) => {
    const payload = {
      path: `${loc_id}/${location_access_id}`,
    };

    delLocationAccess.mutate(payload);
  };

  const handleEdit = async (locationAccess: AccessTable) => {
    await trigger('adgangsforhold');

    const contact = locationAccess.contact_id;
    let id = '';
    if (typeof contact === 'string') id = contact;
    else if (typeof contact === 'object' && contact.id) id = contact.id;

    const payload = {
      path: `${locationAccess.id}`,
      data: {
        id: locationAccess.id ?? -1,
        navn: locationAccess.navn,
        type: locationAccess.type,
        contact_id: id,
        kommentar: locationAccess.kommentar,
        placering: locationAccess.placering ?? null,
        koden: locationAccess.koden ?? null,
      },
    };

    editLocationAccess.mutate(payload, {
      onSuccess: () => {
        setValue('adgangsforhold', initialLocationAccessData);
      },
    });
  };
  return (
    <Grid container spacing={1} my={1} justifyContent="center" alignItems="center">
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
            <Dialog
              open={openDialog}
              onClose={handleClose}
              aria-labelledby="form-dialog-title"
              fullWidth
            >
              <DialogTitle id="form-dialog-title">Tilføj nøgle eller kode</DialogTitle>
              <DialogContent>
                <SelectLocationAccess loc_id={loc_id} />
                <Grid item mt={1}>
                  <Divider sx={{bgcolor: 'secondary.light', paddingTop: 0.1, paddingBottom: 0.1}} />
                </Grid>
                <LocationAccessFormDialog loc_id={loc_id} />
              </DialogContent>
              <DialogActions>
                <Button onClick={handleClose} bttype="tertiary">
                  Annuller
                </Button>
                <Button onClick={handleSave} bttype="primary" startIcon={<Save />}>
                  Gem
                </Button>
              </DialogActions>
            </Dialog>
          </Grid>
        </>
      )}
    </Grid>
  );
};
export default LocationAccess;
