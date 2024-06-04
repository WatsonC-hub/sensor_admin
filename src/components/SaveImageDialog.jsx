import {Edit, Save} from '@mui/icons-material';
import {CircularProgress, Grid, TextField, Typography, Box} from '@mui/material';
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

import OwnDatePicker from './OwnDatePicker';

function SaveImageDialog({activeImage, changeData, id, type, open, dataUri, handleCloseSave}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const imageUrl = `/static/images/${activeImage.imageurl}`;

  const {post: uploadImage, put: editImage} = useImageUpload(type);

  function saveImage() {
    console.log('Hit Once');
    if (activeImage.gid === -1) {
      console.log('Hit Twice');
      const payload = {
        path: id,
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
        path: `${id}/${activeImage.gid}`,
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
    <Dialog
      open={open}
      onClose={handleCloseSave}
      fullWidth={true}
      maxWidth="lg"
      fullScreen={matches}
    >
      <DialogTitle id="form-dialog-title">Gem billede</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid
            item
            xs={12}
            sm={12}
            sx={{
              display: 'flex',
            }}
          >
            <img
              src={activeImage.gid === -1 ? dataUri : imageUrl}
              height="800px"
              style={{maxWidth: '800px', objectFit: 'cover', margin: 'auto'}}
              loading="lazy"
            />
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
        <Button onClick={handleCloseSave} bttype="tertiary">
          Annuller
        </Button>
        <Button onClick={saveImage} disabled={uploadImage.isLoading} bttype="primary">
          {uploadImage.isLoading ? (
            <CircularProgress />
          ) : activeImage.gid == -1 ? (
            <Box display={'flex'} gap={1} alignItems={'center'}>
              <Save />
              <Typography variant="body2" fontSize={14}>
                Gem
              </Typography>
            </Box>
          ) : (
            <Box display="flex" alignItems="center" gap={1}>
              <Edit />
              <Typography variant="body2" fontSize={14}>
                Rediger
              </Typography>
            </Box>
          )}
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveImageDialog;
