import SaveIcon from '@mui/icons-material/Save';
import {
  Button,
  Card,
  CardContent,
  Grid,
  InputAdornment,
  TextField,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import OwnDatePicker from './OwnDatePicker';

export default function MaalepunktForm({formData, changeFormData, handleSubmit, handleCancel}) {
  const [disableSubmit, setDisableSubmit] = useState(false);

  useEffect(() => {
    window.scrollTo({top: 300, behavior: 'smooth'});
  }, []);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  const handleStartdateChange = (date) => {
    if (moment(date).isValid()) {
      changeFormData('startdate', date);
    }
  };

  const handleEnddateChange = (date) => {
    if (moment(date).isValid()) {
      changeFormData('enddate', date);
    }
  };

  const handleCommentChange = (e) => {
    changeFormData('mp_description', e.target.value);
  };

  const handleElevationChange = (e) => {
    changeFormData('elevation', e.target.value);
  };

  return (
    <Card
      style={{marginBottom: 25}}
      sx={{
        width: {xs: '100%', sm: '60%'},
        marginLeft: {xs: '0%', sm: '20%'},
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
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
              value={formData.startdate}
              onChange={(date) => handleStartdateChange(date)}
              fullWidth
            />
          </Grid>
          {formData.gid !== -1 && (
            <Grid item xs={12} sm={6}>
              <OwnDatePicker
                label={'Slut dato'}
                value={formData.enddate}
                onChange={(date) => handleEnddateChange(date)}
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
          <Grid item xs={2} sm={4}></Grid>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              onClick={() => {
                handleClickSubmit();
                handleSubmit();
              }}
              disabled={disableSubmit}
              startIcon={<SaveIcon />}
              color="secondary"
              variant="contained"
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button onClick={handleCancel} color="grey" variant="contained">
              Annuller
            </Button>
          </Grid>
          <Grid item xs={2} sm={4}></Grid>
        </Grid>
        <Grid item xs={2} sm={4}></Grid>
      </CardContent>
    </Card>
  );
}
