import React, {useState, useEffect} from 'react';
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  FormControlLabel,
  useTheme,
  useMediaQuery,
  Tooltip,
  Checkbox,
  InputAdornment,
  Box,
  Link,
  Radio,
  RadioGroup,
  FormControl,
  FormLabel,
} from '@mui/material';
import {isValid} from 'date-fns';
import moment from 'moment';
import SaveIcon from '@mui/icons-material/Save';
import OwnDatePicker from '../../../../components/OwnDatePicker';

export default function PejlingFormBorehole({
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
  mpData,
  openAddMP,
  stamdata,
}) {
  const [pejlingOutOfRange, setPejlingOutOfRange] = useState(false);
  const [currentMP, setCurrentMP] = useState({
    elevation: null,
    mp_description: '',
  });

  const [notPossible, setNotPossible] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);
  const [isPump, setIsPump] = useState(false);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  useEffect(() => {
    if (mpData.length > 0) {
      var mp = mpData.filter((elem) => {
        if (
          moment(formData.timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(formData.timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });
      if (mp.length > 0) {
        setPejlingOutOfRange(false);
        setCurrentMP(mp[0]);
      } else {
        setPejlingOutOfRange(true);
      }
    }
  }, [formData.gid, mpData]);

  const handleDateChange = (date) => {
    if (isValid(date)) {
      changeFormData('timeofmeas', date);
    }

    var mp = mpData?.filter((elem) => {
      if (moment(date).isSameOrAfter(elem.startdate) && moment(date).isBefore(elem.enddate)) {
        return true;
      }
    });

    if (mp.length > 0) {
      setPejlingOutOfRange(false);
      setCurrentMP(mp[0]);
    } else {
      setPejlingOutOfRange(true);
    }
  };

  const handleNotPossibleChange = (event) => {
    setNotPossible(event.target.checked);
    changeFormData('disttowatertable_m', null);
  };

  return (
    <Card
      style={{marginBottom: 25}}
      sx={{
        width: {xs: '100%', sm: '60%'},
        ml: {xs: '0%', sm: '20%'},
        textAlign: 'center',
        justifyContent: 'center',
        alignContent: 'center',
      }}
    >
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {formData.gid !== -1 ? 'Opdater kontrol' : 'Indberet kontrol'}
        </Typography>
        {!currentMP.elevation ? (
          <Box>
            <Link component="button" variant="body2" color="error" onClick={openAddMP}>
              Tilføj venligst et målepunkt først
            </Link>
          </Box>
        ) : (
          <p></p>
        )}
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          <Grid item xs={12} sm={12}>
            <Box
              sx={{
                justifyContent: 'center',
                display: 'flex',
              }}
            >
              <Box
                sx={{
                  alignItems: 'center',
                  justifyContent: 'center',
                  display: 'flex',
                  flexDirection: 'column',
                }}
              >
                <Tooltip title="f.eks. tør eller overløb">
                  <FormControlLabel
                    control={
                      <Checkbox sx={{color: 'primary.main'}} onChange={handleNotPossibleChange} />
                    }
                    label="Måling ikke mulig"
                  />
                </Tooltip>
                {notPossible && (
                  <FormControl component="fieldset">
                    <RadioGroup
                      value={formData.extrema}
                      onChange={(event) => changeFormData('extrema', event.target.value)}
                    >
                      <FormControlLabel value="O" control={<Radio />} label="Overløb" />
                      <FormControlLabel value="T" control={<Radio />} label="Tør" />
                      <FormControlLabel value="A" control={<Radio />} label="Andet" />
                    </RadioGroup>
                  </FormControl>
                )}
              </Box>
              <Tooltip title="Sæt kryds hvis pumpeinformation skal registreres">
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{color: 'primary.main'}}
                      onChange={(e) => setIsPump(e.target.checked)}
                    />
                  }
                  label="Pumpeboring"
                />
              </Tooltip>
            </Box>
          </Grid>
          <Grid item xs={12} sm={7}>
            <TextField
              sx={{
                '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                '& .MuiOutlinedInput-root': {
                  '& > fieldset': {borderColor: 'primary.main'},
                },
              }}
              type="number"
              variant="outlined"
              label={
                <Typography variant="h5" component="h3">
                  Pejling (nedstik)
                </Typography>
              }
              InputProps={{
                endAdornment: <InputAdornment position="start">m</InputAdornment>,
              }}
              InputLabelProps={{shrink: true}}
              fullWidth
              value={formData.disttowatertable_m}
              onChange={(e) => changeFormData('disttowatertable_m', e.target.value)}
              disabled={notPossible || !currentMP.elevation}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            <Box
              // height={40}
              p={0}
              border={1}
              borderRadius={8}
              borderColor="gray"
            >
              <Typography>
                Målepunkt:
                {currentMP.mp_description ? currentMP.mp_description : ' Ingen beskrivelse'}
              </Typography>
              <Typography>Kote: {pejlingOutOfRange ? '' : currentMP.elevation} m</Typography>
            </Box>
          </Grid>
          <Grid item xs={12} sm={7}>
            <OwnDatePicker
              sx={{
                '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                '& .MuiOutlinedInput-root': {
                  '& > fieldset': {borderColor: 'primary.main'},
                },
              }}
              label={
                <Typography variant="h6" component="h3">
                  Tidspunkt for pejling
                </Typography>
              }
              value={formData.timeofmeas}
              onChange={(date) => handleDateChange(date)}
              error={pejlingOutOfRange}
              helperText={pejlingOutOfRange ? 'Dato ligger uden for et målepunkt' : ''}
            />
          </Grid>
          <Grid item xs={12} sm={7}>
            {isPump && (
              <>
                <FormControlLabel
                  control={
                    <Checkbox
                      sx={{color: 'primary.main'}}
                      checked={formData.service}
                      onChange={(e) => changeFormData('service', e.target.checked ? 1 : 0)}
                      name="checkedService"
                      disabled={notPossible}
                    />
                  }
                  label="Driftpejling"
                />
                <OwnDatePicker
                  sx={{
                    '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                    '& .MuiOutlinedInput-root': {
                      '& > fieldset': {borderColor: 'primary.main'},
                    },
                  }}
                  label={
                    <Typography variant="h6" component="h3">
                      Tidspunkt for pumpestop
                    </Typography>
                  }
                  value={formData.pumpstop}
                  onChange={(date) => changeFormData('pumpstop', date)}
                  disabled={!!formData.service}
                />
              </>
            )}
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              sx={{
                '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
                '& .MuiOutlinedInput-root': {
                  '& > fieldset': {borderColor: 'primary.main'},
                },
              }}
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={formData.comment}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{shrink: true}}
              fullWidth
              onChange={(e) => changeFormData('comment', e.target.value)}
            />
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              color="secondary"
              variant="contained"
              onClick={() => {
                handleClickSubmit();
                handleSubmit();
              }}
              disabled={disableSubmit || !currentMP.elevation}
              startIcon={<SaveIcon />}
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button autoFocus color="secondary" variant="contained" onClick={resetFormData}>
              Annuller
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
