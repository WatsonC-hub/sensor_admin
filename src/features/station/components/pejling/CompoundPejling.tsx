import {
  Typography,
  InputAdornment,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
} from '@mui/material';
import React, {useContext, useEffect} from 'react';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {PejlingBoreholeItem, PejlingItem} from './PejlingSchema';
import {Controller, useFormContext} from 'react-hook-form';
import {correction_map} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import IngenMPAlert from '~/features/pejling/components/IngenMPAlert';
import Button from '~/components/Button';
import {Save} from '@mui/icons-material';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAtom, useSetAtom} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import moment from 'moment';
import {LatestMeasurement, Maalepunkt} from '~/types';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {get} from 'lodash';
import DisplayWaterlevelAlert from '~/features/pejling/components/WaterlevelAlert';

interface PejlingProps {
  submit: (values: PejlingItem | PejlingBoreholeItem) => void;
  latestMeasurement: LatestMeasurement | undefined;
  openAddMP: () => void;
  setDynamic: (dynamic: Array<string | number>) => void;
  children?: React.ReactNode;
}

interface CompoundPejlingProps extends PejlingProps {
  hide: boolean;
  isWaterLevel?: boolean;
  currentMP?: Maalepunkt | null;
  elevationDiff?: number;
  notPossible?: boolean;
}

const CompoundPejlingContext = React.createContext<CompoundPejlingProps>({
  submit: () => {},
  openAddMP: () => {},
  setDynamic: () => {},
  latestMeasurement: undefined,
  hide: false,
  isWaterLevel: false,
  currentMP: null,
  elevationDiff: 0,
  notPossible: false,
});

const CompoundPejling = ({
  children,
  submit,
  openAddMP,
  setDynamic,
  latestMeasurement,
}: PejlingProps) => {
  const {watch} = useFormContext<PejlingItem | PejlingBoreholeItem>();
  const timeofmeas = watch('timeofmeas');
  const measurement = watch('measurement');
  const notPossible = watch('notPossible');
  const {data: timeseries} = useTimeseriesData();
  const isWaterLevel = timeseries?.tstype_id === 1;
  const [elevationDiff, setElevationDiff] = React.useState<number | undefined>(undefined);
  const [hide, setHide] = React.useState<boolean>(false);
  const [currentMP, setCurrentMP] = React.useState<Maalepunkt | null>(null);
  const tstype_id = timeseries?.tstype_id;
  const {
    get: {data: mpData},
  } = useMaalepunkt();

  useEffect(() => {
    let latestmeas: number | undefined = undefined;
    let dynamicMeas: number | undefined = undefined;
    if (isWaterLevel && mpData !== undefined && mpData.length > 0) {
      const mp: Maalepunkt[] = mpData.filter((elem: Maalepunkt) => {
        if (
          moment(timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });
      const internalCurrentMP = mp.length > 0 ? mp[0] : null;
      setCurrentMP(internalCurrentMP);

      if (internalCurrentMP) {
        dynamicMeas = internalCurrentMP.elevation - Number(measurement);
        setDynamic([timeofmeas, dynamicMeas]);
        latestmeas = latestMeasurement?.measurement;

        const diff = moment(timeofmeas).diff(moment(latestMeasurement?.timeofmeas), 'days');
        setHide(Math.abs(diff) > 1);
      } else {
        setDynamic([]);
        setHide(true);
      }
    } else {
      dynamicMeas = Number(measurement);
      setDynamic([timeofmeas, dynamicMeas]);
    }
    if (latestmeas == undefined || dynamicMeas == undefined) setElevationDiff(undefined);
    else setElevationDiff(Math.abs(dynamicMeas - latestmeas));
  }, [mpData, measurement, timeofmeas, tstype_id]);

  if (isWaterLevel && mpData !== undefined && mpData.length < 1)
    return <CompoundPejling.MPAlert openAddMP={openAddMP} />;

  return (
    <CompoundPejlingContext.Provider
      value={{
        submit,
        openAddMP,
        setDynamic,
        latestMeasurement,
        hide,
        currentMP,
        isWaterLevel,
        elevationDiff,
        notPossible,
      }}
    >
      {children}
    </CompoundPejlingContext.Provider>
  );
};

const CancelButton = () => {
  const setIsPump = useSetAtom(boreholeIsPumpAtom);
  const {reset} = useFormContext<PejlingItem>();
  const [, setShowForm] = useShowFormState();
  const handleCancel = () => {
    setShowForm(null);
    reset();
    setIsPump(false);
  };

  return (
    <Button bttype="tertiary" fullWidth={false} onClick={handleCancel}>
      Annuller
    </Button>
  );
};

const SubmitButton = () => {
  const {submit} = React.useContext(CompoundPejlingContext);
  const {
    handleSubmit,
    formState: {errors},
  } = useFormContext<PejlingItem | PejlingBoreholeItem>();

  return (
    <Button
      bttype="primary"
      fullWidth={false}
      startIcon={<Save />}
      disabled={Object.keys(errors).length > 0}
      onClick={handleSubmit(submit, (e) => {
        console.log(e);
      })}
    >
      Gem
    </Button>
  );
};

const Measurement = (props: Omit<FormInputProps<PejlingItem>, 'name'>) => {
  const {notPossible, isWaterLevel} = useContext(CompoundPejlingContext);
  const {
    formState: {errors},
  } = useFormContext<PejlingItem>();

  const pejlingOutOfRange = get(errors, 'timeofmeas')?.type == 'outOfRange';
  const {data: metadata} = useTimeseriesData();
  const stationUnit = metadata?.unit;
  return (
    <FormInput
      type="number"
      name="measurement"
      label={isWaterLevel ? 'Pejling (nedstik)' : 'Måling'}
      rules={{required: !notPossible}}
      disabled={notPossible || (isWaterLevel && pejlingOutOfRange)}
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">{isWaterLevel ? 'm' : stationUnit}</InputAdornment>
        ),
      }}
      fullWidth
      {...props}
    />
  );
};

const TimeOfMeas = (props: Omit<FormInputProps<PejlingItem>, 'name'>) => {
  return (
    <FormInput
      name="timeofmeas"
      label="Dato"
      fullWidth
      type="datetime-local"
      required
      sx={{mb: 2}}
      {...props}
    />
  );
};

const Comment = (props: Omit<FormInputProps<PejlingItem>, 'name'>) => {
  return (
    <FormInput
      name="comment"
      label="Kommentar"
      required
      fullWidth
      multiline
      rows={4}
      sx={{mb: 2}}
      {...props}
    />
  );
};

const Correction = (props: Omit<FormInputProps<PejlingItem>, 'name'>) => {
  const {isMobile} = useBreakpoints();
  const {control} = useFormContext();
  const {isWaterLevel} = useContext(CompoundPejlingContext);

  if (!isWaterLevel) return null;

  return (
    <Controller
      control={control}
      name="useforcorrection"
      rules={{required: true}}
      render={({field}) => {
        return (
          <FormControl component="fieldset">
            <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>
            <RadioGroup value={field.value + ''} onChange={field.onChange}>
              <FormControlLabel
                value={0}
                control={<Radio />}
                label={<Typography variant={isMobile ? 'body2' : 'body1'}>Kontrol</Typography>}
              />
              <FormControlLabel
                value={1}
                control={<Radio />}
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Korrektion fremadrettet
                  </Typography>
                }
              />
              <FormControlLabel
                value={-1}
                control={<Radio />}
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Korrektion bagud og fremadrettet
                  </Typography>
                }
              />
              {['-1', '2', '4', '5', '6'].includes(field.value.toString()) && (
                <>
                  {Object.keys(correction_map)
                    .filter((x) => !['0', '1', '3'].includes(x.toString()))
                    .map((element, index) => {
                      const value = Object.values(correction_map).filter(
                        (x) => !['Kontrol', 'Korrektion fremadrettet', 'Lineær'].includes(x)
                      )[index];
                      return (
                        <FormControlLabel
                          key={element}
                          value={Number(element)}
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
      {...props}
    />
  );
};

const NotPossible = () => {
  const {control} = useFormContext<PejlingItem>();
  return (
    <Controller
      name="notPossible"
      control={control}
      defaultValue={false}
      render={({field: {value, onChange}}) => (
        <FormControlLabel
          control={
            <Checkbox
              checked={value}
              onChange={(e) => {
                onChange(e);
              }}
            />
          }
          label="Måling ikke mulig"
        />
      )}
    />
  );
};

const MPAlert = ({openAddMP}: {openAddMP: () => void}) => {
  return <IngenMPAlert openAddMP={openAddMP} />;
};

const Extrema = () => {
  const {control} = useFormContext<PejlingBoreholeItem>();
  return (
    <Controller
      control={control}
      name="extrema"
      render={({field}) => {
        return (
          <>
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue=""
                onChange={field.onChange}
                name="radio-buttons-group"
              >
                <FormControlLabel value="O" control={<Radio />} label="Overløb" />
                <FormControlLabel value="T" control={<Radio />} label="Tør" />
                <FormControlLabel value="A" control={<Radio />} label="Andet" />
              </RadioGroup>
            </FormControl>
          </>
        );
      }}
    />
  );
};

const WaterlevelAlert = () => {
  const {
    watch,
    formState: {errors},
  } = useFormContext<PejlingItem | PejlingBoreholeItem>();
  const {latestMeasurement, hide, isWaterLevel, currentMP, elevationDiff} =
    useContext(CompoundPejlingContext);
  const pejlingOutOfRange = get(errors, 'timeofmeas')?.type == 'outOfRange';
  const notPossible = watch('notPossible');

  return (
    <>
      {isWaterLevel === true && notPossible === false && currentMP !== undefined && (
        <DisplayWaterlevelAlert
          koteTitle={pejlingOutOfRange || currentMP == null ? '' : currentMP.elevation.toString()}
          MPTitle={currentMP ? currentMP.mp_description : ' Ingen beskrivelse'}
          elevationDiff={elevationDiff}
          latestMeasurementSeverity={
            (elevationDiff && elevationDiff > 0.03) || !latestMeasurement ? 'warning' : 'info'
          }
          hide={hide}
          pejlingOutOfRange={pejlingOutOfRange || !currentMP}
        />
      )}
    </>
  );
};

const IsPump = () => {
  const [isPump, setIsPump] = useAtom(boreholeIsPumpAtom);

  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{color: 'primary.main'}}
          checked={isPump}
          onChange={(e) => setIsPump(e.target.checked)}
        />
      }
      label="Pumpeboring"
    />
  );
};

const Service = () => {
  const {control} = useFormContext<PejlingBoreholeItem>();
  return (
    <Controller
      name="service"
      control={control}
      defaultValue={false}
      render={({field: {value, onChange}}) => (
        <FormControlLabel
          control={
            <Checkbox
              sx={{color: 'primary.main'}}
              checked={value}
              onChange={(e) => {
                onChange(e);
              }}
            />
          }
          label="Driftpejling"
        />
      )}
    />
  );
};

const PumpStop = (props: Omit<FormInputProps<PejlingBoreholeItem>, 'name'>) => {
  return (
    <FormInput
      type="datetime-local"
      name="pumpstop"
      label="Tidspunkt for pumpestop"
      fullWidth
      {...props}
    />
  );
};

CompoundPejling.Measurement = Measurement;
CompoundPejling.TimeOfMeas = TimeOfMeas;
CompoundPejling.Comment = Comment;
CompoundPejling.Correction = Correction;
CompoundPejling.NotPossible = NotPossible;
CompoundPejling.MPAlert = MPAlert;
CompoundPejling.WaterlevelAlert = WaterlevelAlert;
CompoundPejling.CancelButton = CancelButton;
CompoundPejling.SubmitButton = SubmitButton;
CompoundPejling.Extrema = Extrema;
CompoundPejling.IsPump = IsPump;
CompoundPejling.Service = Service;
CompoundPejling.PumpStop = PumpStop;

export default CompoundPejling;
