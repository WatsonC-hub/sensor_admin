import {CircularProgress, Grid, TextField, Typography} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import React from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import {useImageUpload} from '~/hooks/query/useImageUpload';

import OwnDatePicker from '../../../../components/OwnDatePicker';

function SaveImageDialogBorehole({
  activeImage,
  changeData,
  boreholeno,
  open,
  dataUri,
  handleCloseSave,
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const imageUrl = `/static/images/${activeImage.imageurl}?format=auto&width=${1024}`;

  const {post: uploadImage, put: editImage} = useImageUpload('borehole');

  function saveImage() {
    if (activeImage.gid === -1) {
      const payload = {
        path: boreholeno,
        data: {
          comment: activeImage.comment,
          public: activeImage.public.toString(),
          date: moment(activeImage.date).toISOString(),
          uri: dataUri,
        },
      };

      toast.promise(() => uploadImage.mutateAsync(payload), {
        pending: 'Gemmer billede',
        success: {
          render({data}) {
            handleCloseSave();
            return 'Billede gemt';
          },
        },
        error: 'Der skete en fejl',
      });
    } else {
      const payload = {
        path: `${boreholeno}/${activeImage.gid}`,
        data: {
          comment: activeImage.comment,
          public: activeImage.public.toString(),
          date: moment(activeImage.date).toISOString(),
        },
      };

      toast.promise(() => editImage.mutateAsync(payload), {
        pending: 'Gemmer billede',
        success: {
          render({data}) {
            handleCloseSave();
            return 'Billede gemt';
          },
        },
        error: 'Der skete en fejl',
      });
    }
  }

  return (
    <div>
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
              <img src={activeImage.gid === -1 ? dataUri : imageUrl} />
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
                onChange={(event) => changeData('comment', event.target.value)}
              />
            </Grid>
            <Grid item xs={12} sm={6}>
              <FormControlLabel
                control={
                  <Checkbox
                    checked={activeImage.public}
                    onChange={(event) => changeData('public', event.target.checked)}
                    name="checkedBattery"
                    color="primary"
                  />
                }
                label={<label>Offentliggør på Calypso</label>}
              />
              <OwnDatePicker
                label={'Dato'}
                value={moment(activeImage.date)}
                onChange={(date) => changeData('date', moment(date).format('YYYY-MM-DD HH:mm'))}
              />
            </Grid>
          </Grid>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCloseSave} btType="tertiary">
            Annuller
          </Button>
          <Button onClick={saveImage} disabled={uploadImage.isLoading} btType="primary">
            {uploadImage.isLoading ? (
              <CircularProgress />
            ) : activeImage.gid == -1 ? (
              'Tilføj'
            ) : (
              'Ændre'
            )}
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}

export default SaveImageDialogBorehole;
