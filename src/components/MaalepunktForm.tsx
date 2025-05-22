import SaveIcon from '@mui/icons-material/Save';
import {Box, Card, CardContent, Grid, InputAdornment, TextField, Typography} from '@mui/material';
import moment from 'moment';
import React, {useState} from 'react';

import Button from '~/components/Button';
import OwnDatePicker from '~/components/OwnDatePicker';
import {Maalepunkt} from '~/types';

interface MaalepunktFormProps {
  formData: Maalepunkt;
  changeFormData: (key: string, value: any) => void;
  handleSubmit: () => void;
  handleCancel: () => void;
}

export default function MaalepunktForm({
  formData,
  changeFormData,
  handleSubmit,
  handleCancel,
}: MaalepunktFormProps) {
  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  const handleStartdateChange = (date: Date) => {
    if (moment(date).isValid()) {
      changeFormData('startdate', date);
    }
  };

  const handleEnddateChange = (date: Date) => {
    if (moment(date).isValid()) {
      changeFormData('enddate', date);
    }
  };

  const handleCommentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    changeFormData('mp_description', e.target.value);
  };

  const handleElevationChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    changeFormData('elevation', e.target.value);
  };

  return (
    <Card
      style={{marginBottom: 25}}
      sx={{
        width: {xs: '100%', sm: '60%'},
        marginLeft: {xs: '0%'},
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
        alignSelf: 'center',
      }}
    >
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {formData.gid !== -1 ? 'Opdater målepunkt' : 'Indberet målepunkt'}
        </Typography>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={8}>
            <TextField
              type="number"
              variant="outlined"
              label={
                <Typography variant="h5" component="h3">
                  Pejlepunkt [m]
                </Typography>
              }
              InputProps={{
                endAdornment: <InputAdornment position="start">m</InputAdornment>,
              }}
              InputLabelProps={{shrink: true}}
              fullWidth
              value={formData.elevation}
              onChange={handleElevationChange}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <OwnDatePicker
              label={'Start dato'}
              value={moment(formData.startdate).toDate()}
              onChange={(date: Date) => handleStartdateChange(date)}
              fullWidth
            />
          </Grid>
          {formData.gid !== -1 && (
            <Grid item xs={12} sm={6}>
              <OwnDatePicker
                label={'Slut dato'}
                value={moment(formData.enddate).toDate()}
                onChange={(date: Date) => handleEnddateChange(date)}
                fullWidth
              />
            </Grid>
          )}
          <Grid item xs={12} sm={10}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={formData.mp_description}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{shrink: true}}
              fullWidth
              onChange={handleCommentChange}
            />
          </Grid>
          <Grid item xs={12} sm={4}>
            <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
              <Button onClick={handleCancel} bttype="tertiary">
                Annuller
              </Button>
              <Button
                onClick={() => {
                  handleClickSubmit();
                  handleSubmit();
                }}
                disabled={disableSubmit}
                startIcon={<SaveIcon />}
                bttype="primary"
              >
                Gem
              </Button>
            </Box>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
