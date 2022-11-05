import React, {useState} from 'react';
import {postImage, updateImage} from 'src/pages/field/fieldAPI';
import {TextField, Typography, Grid, Button, CircularProgress} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import moment from 'moment';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import OwnDatePicker from './OwnDatePicker';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useTheme} from '@mui/material/styles';
import {useQueryClient, useMutation} from '@tanstack/react-query';
import {toast} from 'react-toastify';

function SaveImageDialog({activeImage, changeData, locationId, open, dataUri, handleCloseSave}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const queryClient = useQueryClient();

  const baseUrl = 'https://calypsoimages.s3.eu-north-1.amazonaws.com/location_images/';
  const imageUrl = baseUrl + activeImage.imageurl + '.png';

  const saveImageMutation = useMutation(
    data => {
      if (activeImage.gid !== -1) {
        return updateImage(data, activeImage.gid);
      } else {
        return postImage(data, dataUri);
      }
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries(['images', locationId]);
        handleCloseSave();
      },
    }
  );

  function saveImage() {
    const payload = {
      loc_id: locationId,
      comment: activeImage.comment,
      public: activeImage.public.toString(),
      date: moment(activeImage.date).format('YYYY-MM-DD HH:mm'),
    };
    console.log(payload);

    toast.promise(() => saveImageMutation.mutateAsync(payload), {
      pending: 'Gemmer billede',
      success: 'Billede gemt',
      error: 'Der skete en fejl',
    });
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseSave}
      fullWidth={true}
      maxWidth="lg"
      fullScreen={matches}
    >
      <DialogTitle id="form-dialog-title">Gem billede</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} style={{width: '100%'}}>
          <Grid item xs={12} sm={12} style={{width: '100%'}}>
            <img src={activeImage.gid === -1 ? dataUri : imageUrl} style={{width: '100%'}} />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={activeImage.comment}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{shrink: true}}
              fullWidth
              onChange={event => changeData('comment', event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={activeImage.public}
                  onChange={event => changeData('public', event.target.checked)}
                  name="checkedBattery"
                  color="primary"
                />
              }
              label={<label>Offentliggør på Calypso</label>}
            />
            <OwnDatePicker
              label={'Dato'}
              value={moment(activeImage.date)}
              onChange={date => changeData('date', moment(date).format('YYYY-MM-DD HH:mm'))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={saveImage}
          disabled={saveImageMutation.isLoading}
          color="secondary"
          variant="contained"
        >
          {saveImageMutation.isLoading ? <CircularProgress /> : 'Tilføj'}
        </Button>
        <Button onClick={handleCloseSave} color="secondary" variant="contained">
          Annuller
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveImageDialog;
