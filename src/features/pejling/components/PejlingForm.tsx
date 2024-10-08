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
  Tooltip,
  Typography,
} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {Controller, useFormContext, get} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import {alertHeight, correction_map} from '~/consts';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {stamdataStore} from '~/state/store';
import {Maalepunkt, PejlingItem} from '~/types';
// TODO
// - Find ud af om textfield skal have grøn outline

interface PejlingFormProps {
  handleSubmit: (data: any) => void;
  resetFormData: () => void;
  isWaterlevel: boolean;
  isFlow: boolean;
  openAddMP: () => void;
  setDynamic: (dynamic: Array<unknown>) => void;
}

export default function PejlingForm({
  handleSubmit,
  resetFormData,
  isWaterlevel,
  isFlow,
  openAddMP,
  setDynamic,
}: PejlingFormProps) {
  const store = stamdataStore();
  const tstype_id = store.timeseries.tstype_id;
  const {
    get: {data: mpData},
  } = useMaalepunkt();
  const formMethods = useFormContext<PejlingItem>();

  const [currentMP, setCurrentMP] = useState<Maalepunkt | null>(null);

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
      const internalCurrentMP = mp.length > 0 ? mp[0] : null;
      if (internalCurrentMP) {
        setCurrentMP(internalCurrentMP);
      } else {
        setCurrentMP(null);
      }

      if (tstype_id) {
        if (internalCurrentMP) {
          const dynamicDate = formMethods.getValues('timeofmeas');
          const dynamicMeas = internalCurrentMP.elevation - Number(measurement);
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

  const handleDateChange = (date: string) => {
    if (isWaterlevel && mpData !== undefined) {
      const mp = mpData.filter((elem) => {
        if (moment(date).isSameOrAfter(elem.startdate) && moment(date).isBefore(elem.enddate)) {
          return true;
        }
      });
      if (mp.length > 0) {
        setCurrentMP(mp[0]);
        formMethods.clearErrors('timeofmeas');
      } else {
        formMethods.setError('timeofmeas', {
          type: 'outOfRange',
          message: 'Tidspunkt er uden for et målepunkt',
        });
      }
    }
  };

  const handleNotPossibleChange = () => {
    setNotPossible(!notPossible);
    formMethods.setValue('measurement', 0);
  };

  const pejlingOutOfRange = get(formMethods.formState.errors, 'timeofmeas')?.type == 'outOfRange';

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
                <FormInput
                  type="number"
                  name="measurement"
                  rules={{required: true}}
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
                  disabled={notPossible || (isWaterlevel && currentMP == null)}
                />
              </Grid>
              {isWaterlevel && (
                <>
                  <Grid item xs={12} sm={7}>
                    <Alert
                      severity={pejlingOutOfRange ? 'error' : 'info'}
                      sx={{
                        display: 'flex',
                        justifyContent: 'center',
                        alignItems: 'center',
                      }}
                    >
                      {pejlingOutOfRange ? (
                        <Typography>
                          Der er intet målepunkt registreret på det valgte tidspunkt.
                        </Typography>
                      ) : (
                        <>
                          <Typography>
                            Målepunkt: {currentMP ? currentMP.mp_description : ' Ingen beskrivelse'}
                          </Typography>
                          <Typography>
                            Kote:{' '}
                            {pejlingOutOfRange || currentMP == null ? '' : currentMP.elevation} m
                          </Typography>
                        </>
                      )}
                    </Alert>
                  </Grid>
                </>
              )}
              <Grid item xs={12} sm={7}>
                <FormInput
                  name="timeofmeas"
                  label="Dato"
                  fullWidth
                  type="datetime-local"
                  required
                  sx={{
                    mb: 2,
                  }}
                  onChangeCallback={(e) => handleDateChange(e.target.value)}
                  // error={pejlingOutOfRange}
                  // warning={() => (pejlingOutOfRange ? 'Dato ligger uden for et målepunkt' : '')}
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
                  rows={4}
                  sx={{
                    mb: 2,
                  }}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <Box display="flex" gap={1} justifyContent={{xs: 'flex-end', sm: 'center'}}>
              <Button
                bttype="tertiary"
                onClick={() => {
                  resetFormData();
                  setDynamic([]);
                }}
              >
                Annuller
              </Button>
              <Button
                bttype="primary"
                onClick={formMethods.handleSubmit(handleSubmit)}
                disabled={
                  pejlingOutOfRange ||
                  (isWaterlevel && currentMP === null) ||
                  formMethods.getValues('useforcorrection').toString() == '-1'
                }
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
