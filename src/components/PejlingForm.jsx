import SaveIcon from '@mui/icons-material/Save';
import {
  Alert,
  Box,
  Card,
  CardContent,
  Checkbox,
  FormControl,
  FormControlLabel,
  FormLabel,
  Grid,
  InputAdornment,
  Link,
  Radio,
  RadioGroup,
  TextField,
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {stamdataStore} from '../state/store';
import OwnDatePicker from './OwnDatePicker';
import Button from '~/components/Button';

// TODO
// - Find ud af om textfield skal have grøn outline
export default function PejlingForm({
  stationId,
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
  mpData,
  isWaterlevel,
  isFlow,
  openAddMP,
}) {
  const [pejlingOutOfRange, setPejlingOutOfRange] = useState(false);

  const [currentMP, setCurrentMP] = useState({
    elevation: null,
    mp_description: '',
  });

  const [notPossible, setNotPossible] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);

  const [stationUnit] = stamdataStore((state) => [state.timeseries.unit]);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  const handleUsageChange = (e) => {
    changeFormData('useforcorrection', e.target.value);
  };

  useEffect(() => {
    if (mpData !== undefined && mpData.length > 0) {
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
        setCurrentMP({
          elevation: null,
          mp_description: '',
        });
      }
    }
  }, [formData.gid, mpData]);

  const handleDateChange = (date) => {
    if (moment(date).isValid()) {
      changeFormData('timeofmeas', date);
    }

    if (isWaterlevel) {
      var mp = mpData.filter((elem) => {
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
    }
  };

  const handleCommentChange = (e) => {
    changeFormData('comment', e.target.value);
  };

  const handleDistanceChange = (e) => {
    changeFormData('measurement', e.target.value);
  };

  const handleNotPossibleChange = (e) => {
    setNotPossible(!notPossible);
    changeFormData('measurement', null);
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
          {formData.gid !== -1 ? 'Opdater kontrol' : 'Indberet kontrol'}
        </Typography>
        <Grid container spacing={3} alignItems="center" justifyContent="center">
          {isWaterlevel && mpData !== undefined && mpData.length < 1 ? (
            <Grid item xs={12} sm={12} display="flex" justifyContent="center">
              <Alert
                severity="error"
                sx={{
                  justifyContent: 'center',
                  display: 'flex',
                  alignItems: 'center',
                  height: '80px',
                }}
              >
                <Link component="button" variant="body2" color="error" onClick={openAddMP}>
                  Tilføj venligst et målepunkt først
                </Link>
              </Alert>
            </Grid>
          ) : (
            <>
              <Grid item xs={12} sm={12}>
                <Tooltip title="f.eks. tør eller tilfrossen">
                  <FormControlLabel
                    control={
                      <Checkbox sx={{color: 'primary.main'}} onChange={handleNotPossibleChange} />
                    }
                    label="Måling ikke mulig"
                  />
                </Tooltip>
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
                      {isWaterlevel ? 'Pejling (nedstik)' : 'Måling'}
                    </Typography>
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">
                        {isWaterlevel ? 'm' : stationUnit}
                      </InputAdornment>
                    ),
                  }}
                  InputLabelProps={{shrink: true}}
                  fullWidth
                  value={formData.measurement}
                  onChange={handleDistanceChange}
                  disabled={notPossible || (isWaterlevel && currentMP.elevation === null)}
                />
              </Grid>
              {isWaterlevel && (
                <>
                  <Grid item xs={12} sm={7}>
                    <Alert
                      severity="info"
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      <Typography>
                        Målepunkt:{' '}
                        {currentMP.mp_description ? currentMP.mp_description : ' Ingen beskrivelse'}
                      </Typography>
                      <Typography>
                        Kote: {pejlingOutOfRange ? '' : currentMP.elevation} m
                      </Typography>
                    </Alert>
                  </Grid>
                </>
              )}
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
                      Tidspunkt for måling
                    </Typography>
                  }
                  value={new Date(formData.timeofmeas)}
                  onChange={(date) => handleDateChange(date)}
                  error={pejlingOutOfRange}
                  helperText={pejlingOutOfRange ? 'Dato ligger uden for et målepunkt' : ''}
                />
              </Grid>
              {(isWaterlevel || isFlow) && (
                <Grid item xs={12} sm={12}>
                  <FormControl component="fieldset">
                    <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>
                    <RadioGroup value={formData.useforcorrection + ''} onChange={handleUsageChange}>
                      <FormControlLabel value="0" control={<Radio />} label="Kontrol" />
                      <FormControlLabel
                        value="1"
                        control={<Radio />}
                        label="Korrektion fremadrettet"
                      />
                      <FormControlLabel
                        value="-1"
                        control={<Radio />}
                        label="Korrektion bagud og fremadrettet"
                      />
                      {['-1', '2', '4', '5', '6'].includes(formData.useforcorrection) && (
                        <>
                          <FormControlLabel
                            value="4"
                            control={<Radio />}
                            label="Tilbage til start af udstyr"
                            sx={{ml: 2}}
                          />
                          <FormControlLabel
                            value="2"
                            control={<Radio />}
                            label="Tilbage til start af tidsserie"
                            sx={{ml: 2}}
                          />
                          <FormControlLabel
                            value="6"
                            control={<Radio />}
                            label="Tilbage til forrige pejling"
                            sx={{ml: 2}}
                          />
                          <FormControlLabel
                            value="5"
                            control={<Radio />}
                            label="Tilbage til forrige niveauspring"
                            sx={{ml: 2}}
                          />
                        </>
                      )}
                    </RadioGroup>
                  </FormControl>
                </Grid>
              )}
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
                  onChange={handleCommentChange}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
                  <Button btType="tertiary" onClick={resetFormData}>
                    Annuller
                  </Button>
                  <Button
                    autoFocus
                    btType="primary"
                    onClick={() => {
                      handleClickSubmit();
                      handleSubmit();
                    }}
                    disabled={
                      pejlingOutOfRange ||
                      disableSubmit ||
                      (isWaterlevel && currentMP.elevation === null) ||
                      formData.useforcorrection == '-1'
                    }
                    startIcon={<SaveIcon />}
                  >
                    Gem kontrol
                  </Button>
                </Box>
              </Grid>
            </>
          )}
        </Grid>
      </CardContent>
    </Card>
  );
}
