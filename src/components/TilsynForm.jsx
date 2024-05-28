import SaveIcon from '@mui/icons-material/Save';
import {Box, Card, CardContent, Grid, TextField, Typography} from '@mui/material';
import Checkbox from '@mui/material/Checkbox';
import FormControlLabel from '@mui/material/FormControlLabel';
import React, {useEffect, useState} from 'react';
import OwnDatePicker from './OwnDatePicker';
import Button from '~/components/Button';
import {BatteryAlertRounded, RemoveRedEyeRounded} from '@mui/icons-material';

export default function TilsynForm({formData, changeFormData, handleSubmit, cancel}) {
  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  const handleCommentChange = (e) => {
    changeFormData('kommentar', e.target.value);
  };

  const handleDateChange = (date) => {
    changeFormData('dato', date);
  };

  const handleChangeBattery = (e) => {
    changeFormData('batteriskift', e.target.checked);
  };

  const handleChangeService = (e) => {
    changeFormData('tilsyn', e.target.checked);
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
          {formData.gid !== -1 ? 'Opdater tilsyn' : 'Indberet tilsyn'}
        </Typography>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={7}>
            <OwnDatePicker
              label={'Dato'}
              value={formData.dato}
              onChange={(date) => handleDateChange(date)}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.batteriskift}
                  onChange={handleChangeBattery}
                  name="checkedBattery"
                  color="primary"
                />
              }
              label={
                <Box display="flex">
                  <BatteryAlertRounded sx={{color: 'grey.700'}} />
                  <Typography alignSelf="center">Batteriskift</Typography>
                </Box>
              }
            />

            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.tilsyn}
                  onChange={handleChangeService}
                  name="checkedService"
                  color="primary"
                />
              }
              label={
                <Box display="flex" gap={1}>
                  <RemoveRedEyeRounded sx={{color: 'grey.700'}} />
                  <Typography alignSelf="center">Tilsyn</Typography>
                </Box>
              }
            />
          </Grid>
          <Grid item xs={12} sm={10}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={formData.kommentar}
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
              <Button btType="tertiary" onClick={cancel}>
                Annuller
              </Button>
              <Button
                autoFocus
                btType="primary"
                onClick={() => {
                  handleClickSubmit();
                  handleSubmit();
                }}
                disabled={disableSubmit}
                startIcon={<SaveIcon />}
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
