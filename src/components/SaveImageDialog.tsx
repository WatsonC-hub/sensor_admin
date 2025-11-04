import {Edit, Save} from '@mui/icons-material';
import {Grid, TextField, Typography, Box} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import FormControlLabel from '@mui/material/FormControlLabel';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import dayjs, {Dayjs} from 'dayjs';
import React from 'react';
import {toast} from 'react-toastify';

import Button from '~/components/Button';
import OwnDatePicker from '~/components/OwnDatePicker';
import {useImageUpload} from '~/hooks/query/useImageUpload';

interface SaveImageDialogProps {
  activeImage: {
    gid: number;
    comment: string;
    public: boolean;
    date: Dayjs;
    imageurl?: string; // Assuming this property exists
    // Add any other properties as needed
  };
  changeData: (field: string, value: any) => void;
  id: string | number;
  type: string;
  open: boolean;
  dataUri: string | ArrayBuffer | null;
  handleCloseSave: () => void;
}

function SaveImageDialog({
  activeImage,
  changeData,
  id,
  type,
  open,
  dataUri,
  handleCloseSave,
}: SaveImageDialogProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const imageUrl = `/static/images/${activeImage.imageurl}`;

  const {post: uploadImage, put: editImage} = useImageUpload(type);

  function saveImage() {
    if (activeImage.gid === -1) {
      const payload = {
        path: id,
        data: {
          comment: activeImage.comment,
          public: activeImage.public.toString(),
          date: activeImage.date,
          uri: dataUri,
        },
      };

      uploadImage.mutate(payload, {
        onSuccess: () => {
          toast.success('Billedet er uploadet');
        },
      });
    } else {
      const payload = {
        path: `${id}/${activeImage.gid}`,
        data: {
          comment: activeImage.comment,
          public: activeImage.public.toString(),
          date: activeImage.date,
        },
      };

      editImage.mutateAsync(payload, {
        onSuccess: () => {
          toast.success('Billedet er opdateret');
        },
      });
    }
    handleCloseSave();
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseSave}
      fullWidth={true}
      maxWidth="md"
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
              alt=""
              src={
                activeImage.gid === -1 && dataUri
                  ? typeof dataUri === 'string'
                    ? dataUri
                    : new TextDecoder().decode(dataUri)
                  : imageUrl
              }
              style={{maxWidth: '100%', objectFit: 'cover', margin: 'auto'}}
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
              value={activeImage.comment ?? ''}
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
              label={'Offentliggør på Calypso'}
            />
            <OwnDatePicker
              label={'Dato'}
              value={activeImage.date}
              onChange={(date) => changeData('date', dayjs(date))}
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleCloseSave} bttype="tertiary">
          Annuller
        </Button>
        <Button onClick={saveImage} bttype="primary">
          {activeImage.gid == -1 ? (
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
