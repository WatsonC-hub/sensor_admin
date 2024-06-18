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
import {Controller, ControllerRenderProps, UseFormReturn} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import OwnDatePicker from '~/components/OwnDatePicker';
import {alertHeight, correction_map} from '~/consts';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {stamdataStore} from '~/state/store';
import {Maalepunkt, PejlingItem} from '~/types';
// TODO
// - Find ud af om textfield skal have grøn outline

interface PejlingFormProps {
  handleSubmit: (values: PejlingItem) => void;
  resetFormData: () => void;
  isWaterlevel: boolean;
  isFlow: boolean;
  openAddMP: () => void;
  formMethods: UseFormReturn<PejlingItem>;
  setDynamic: (dynamic: Array<unknown>) => void;
}

export default function PejlingForm({
  handleSubmit,
  resetFormData,
  isWaterlevel,
  isFlow,
  openAddMP,
  formMethods,
  setDynamic,
}: PejlingFormProps) {
  const store = stamdataStore();
  const tstype_id = store.timeseries.tstype_id;
  const {
    get: {data: mpData},
  } = useMaalepunkt();
  const [pejlingOutOfRange, setPejlingOutOfRange] = useState(false);

  const [currentMP, setCurrentMP] = useState({
    elevation: 0,
    mp_description: '',
  });

  const [notPossible, setNotPossible] = useState(false);
  const [stationUnit] = stamdataStore((state) => [state.timeseries.unit]);
  const measurement = formMethods.watch('measurement');

  useEffect(() => {
    if (mpData !== undefined && mpData.length > 0) {
      const mp: Maalepunkt[] = mpData.filter((elem: Maalepunkt) => {
        if (
          moment(formMethods.getValues('timeofmeas')).isSameOrAfter(elem.startdate) &&
          moment(formMethods.getValues('timeofmeas')).isBefore(elem.enddate)
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
          elevation: 0,
          mp_description: '',
        });
      }
      if (tstype_id) {
        if (currentMP.elevation !== 0) {
          const dynamicDate = formMethods.getValues('timeofmeas');
          const dynamicMeas = currentMP.elevation - Number(measurement);
          setDynamic([dynamicDate, dynamicMeas]);
        } else {
          setDynamic([]);
        }
      }
    } else if (tstype_id !== 1) {
      const dynamicDate = formMethods.getValues('timeofmeas');
      const dynamicMeas = Number(measurement);
      setDynamic([dynamicDate, dynamicMeas]);
    }
  }, [mpData, measurement, tstype_id]);

  const handleDateChange = (
    date: string,
    field: ControllerRenderProps<PejlingItem, 'timeofmeas'>
  ) => {
    if (moment(date).isValid()) {
      field.onChange(date);
    }

    if (isWaterlevel && mpData !== undefined) {
      const mp = mpData.filter((elem) => {
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

  const handleNotPossibleChange = () => {
    setNotPossible(!notPossible);
    formMethods.setValue('measurement', 0);
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
          {formMethods.getValues('gid') !== -1 ? 'Opdater kontrol' : 'Indberet kontrol'}
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
                  height: alertHeight,
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
                <Controller
                  control={formMethods.control}
                  name="measurement"
                  rules={{required: false}}
                  render={({field}) => {
                    return (
                      <TextField
                        type="number"
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
                        fullWidth
                        disabled={notPossible || (isWaterlevel && currentMP.elevation === null)}
                        onChange={(e) => {
                          field.onChange(Number(e.target.value));
                        }}
                      />
                    );
                  }}
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
                <Controller
                  control={formMethods.control}
                  defaultValue={moment().format('YYYY-MM-DDTHH:mm')}
                  name="timeofmeas"
                  rules={{required: true}}
                  render={({field}) => {
                    return (
                      <OwnDatePicker
                        inputRef={field.ref}
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
                        value={field.value}
                        onChange={(date: string) => {
                          handleDateChange(date, field);
                        }}
                        error={pejlingOutOfRange}
                        helperText={pejlingOutOfRange ? 'Dato ligger uden for et målepunkt' : ''}
                      />
                    );
                  }}
                />
              </Grid>
              {(isWaterlevel || isFlow) && (
                <Grid item xs={12} sm={12}>
                  <Controller
                    control={formMethods.control}
                    name="useforcorrection"
                    rules={{required: true}}
                    render={({field}) => {
                      return (
                        <FormControl component="fieldset">
                          <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>
                          <RadioGroup value={field.value + ''} onChange={field.onChange}>
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
                            {['-1', '2', '4', '5', '6'].includes(field.value.toString()) && (
                              <>
                                {Object.keys(correction_map)
                                  .filter((x) => !['0', '1', '3'].includes(x.toString()))
                                  .map((element, index) => {
                                    const value = Object.values(correction_map).filter(
                                      (x) =>
                                        !['Kontrol', 'Korrektion fremadrettet', 'Lineær'].includes(
                                          x
                                        )
                                    )[index];
                                    return (
                                      <FormControlLabel
                                        key={element}
                                        value={element}
                                        control={<Radio />}
                                        label={value}
                                        sx={{ml: 2}}
                                      />
                                    );
                                  })}
                              </>
                            )}
                          </RadioGroup>
                        </FormControl>
                      );
                    }}
                  />
                </Grid>
              )}
              <Grid item xs={12} sm={12}>
                <FormInput
                  name="comment"
                  label="Kommentar"
                  required
                  fullWidth
                  multiline
                  sx={{
                    mb: 2,
                  }}
                />
              </Grid>
              <Grid item xs={12} sm={4}>
                <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
                  <Button bttype="tertiary" onClick={resetFormData}>
                    Annuller
                  </Button>
                  <Button
                    bttype="primary"
                    onClick={formMethods.handleSubmit(handleSubmit)}
                    disabled={
                      pejlingOutOfRange ||
                      (isWaterlevel && currentMP.elevation === null) ||
                      formMethods.getValues('useforcorrection').toString() == '-1'
                    }
                    startIcon={<SaveIcon />}
                  >
                    Gem
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
