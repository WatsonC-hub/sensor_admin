import React, {useState, useEffect} from 'react';
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  Box,
} from '@mui/material';
import {isValid} from 'date-fns';
import {InputAdornment} from '@mui/material';
import moment from 'moment';
import SaveIcon from '@mui/icons-material/Save';
import OwnDatePicker from './OwnDatePicker';
import {Checkbox} from '@mui/material';
import {Tooltip} from '@mui/material';
import {stamdataStore} from '../state/store';

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
    window.scrollTo({top: 300, behavior: 'smooth'});
  }, []);

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
      console.log(mp);
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
      console.log('date is valid again: ', date);
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
        {!currentMP.elevation ? (
          <div>
            <Box>
              <span style={{color: 'red'}}>Tilføj venligst et målepunkt først</span>
            </Box>
            <Button
              autoFocus
              color="secondary"
              variant="contained"
              size="small"
              onClick={() => {
                openAddMP();
              }}
            >
              Indberet målepunkt
            </Button>
          </div>
        ) : (
          <p></p>
        )}
        <Grid container spacing={3} alignItems="center" justifyContent="center">
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
                !currentMP.elevation ? (
                  <Tooltip title="Tilføj først et målepunkt">
                    <Typography variant="h5" component="h3">
                      {isWaterlevel ? 'Pejling (nedstik)' : 'Måling'}
                    </Typography>
                  </Tooltip>
                ) : (
                  <Typography variant="h5" component="h3">
                    {isWaterlevel ? 'Pejling (nedstik)' : 'Måling'}
                  </Typography>
                )
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
              disabled={notPossible || !currentMP.elevation}
            />
          </Grid>
          {isWaterlevel && (
            <>
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
                  <FormControlLabel value="1" control={<Radio />} label="Korrektion fremadrettet" />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label="Korrektion bagud og fremadrettet"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          )}
          {/* {isWaterlevel && (
            <>
              <Grid item xs={12} sm={7}>
                <Box p={0} border={1} borderRadius={8} borderColor="gray">
                  <p>
                    Målepunktskote:{" "}
                    {pejlingOutOfRange ? "" : currentMP.elevation}
                  </p>
                </Box>
              </Grid>
            </>
          )} */}
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

          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              color="secondary"
              variant="contained"
              onClick={() => {
                handleClickSubmit();
                handleSubmit();
              }}
              disabled={pejlingOutOfRange || disableSubmit || !currentMP.elevation}
              startIcon={<SaveIcon />}
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button color="grey" variant="contained" onClick={resetFormData}>
              Annuller
            </Button>
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
