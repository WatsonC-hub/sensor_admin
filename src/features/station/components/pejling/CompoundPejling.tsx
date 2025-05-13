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
import React, {useContext, useEffect, useState} from 'react';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {PejlingBoreholeSchemaType, PejlingSchemaType} from './PejlingSchema';
import {Controller, useFormContext} from 'react-hook-form';
import {correction_map} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import IngenMPAlert from '~/features/pejling/components/IngenMPAlert';
import Button from '~/components/Button';
import {Save} from '@mui/icons-material';
import {useAtom} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import moment from 'moment';
import {LatestMeasurement, Maalepunkt} from '~/types';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {get} from 'lodash';
import DisplayWaterlevelAlert from '~/features/pejling/components/WaterlevelAlert';

interface PejlingProps {
  submit: (values: PejlingSchemaType | PejlingBoreholeSchemaType) => void;
  cancel: () => void;
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
  notPossible: boolean;
  setNotPossible: (notPossible: boolean) => void;
}

const CompoundPejlingContext = React.createContext<CompoundPejlingProps>({
  submit: () => {},
  cancel: () => {},
  openAddMP: () => {},
  setDynamic: () => {},
  latestMeasurement: undefined,
  hide: false,
  isWaterLevel: false,
  currentMP: null,
  elevationDiff: 0,
  notPossible: false,
  setNotPossible: () => {},
});

const CompoundPejling = ({
  children,
  cancel,
  submit,
  openAddMP,
  setDynamic,
  latestMeasurement,
}: PejlingProps) => {
  const {watch, getValues} = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();
  const timeofmeas = watch('timeofmeas');
  const measurement = watch('measurement');
  const [notPossible, setNotPossible] = useState<boolean>(!!getValues('extrema'));

  const {data: timeseries} = useTimeseriesData();
  const isWaterLevel = timeseries?.tstype_id === 1;
  const [elevationDiff, setElevationDiff] = useState<number | undefined>(undefined);
  const [hide, setHide] = useState<boolean>(false);
  const [currentMP, setCurrentMP] = useState<Maalepunkt | null>(null);
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
        cancel,
        latestMeasurement,
        hide,
        currentMP,
        isWaterLevel,
        elevationDiff,
        notPossible,
        setNotPossible,
      }}
    >
      {children}
    </CompoundPejlingContext.Provider>
  );
};

const CancelButton = () => {
  const {cancel} = React.useContext(CompoundPejlingContext);

  return (
    <Button bttype="tertiary" fullWidth={false} onClick={cancel}>
      Annuller
    </Button>
  );
};

const SubmitButton = () => {
  const {submit} = React.useContext(CompoundPejlingContext);
  const {
    handleSubmit,
    formState: {errors},
  } = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();

  return (
    <Button
      bttype="primary"
      fullWidth={false}
      startIcon={<Save />}
      disabled={Object.keys(errors).length > 0}
      onClick={handleSubmit(submit, () => {})}
    >
      Gem
    </Button>
  );
};

const Measurement = (props: Omit<FormInputProps<PejlingSchemaType>, 'name'>) => {
  const {isWaterLevel, notPossible} = useContext(CompoundPejlingContext);
  const {
    formState: {errors},
  } = useFormContext<PejlingSchemaType>();

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

const TimeOfMeas = (
  props: Omit<FormInputProps<PejlingSchemaType | PejlingBoreholeSchemaType>, 'name'>
) => {
  const {watch, trigger} = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();
  const service = watch('service');
  return (
    <FormInput
      name="timeofmeas"
      label="Dato"
      fullWidth
      type="datetime-local"
      onChangeCallback={() => {
        if (!service) {
          trigger('pumpstop');
        }
      }}
      required
      sx={{mb: 2}}
      {...props}
    />
  );
};

const Comment = (props: Omit<FormInputProps<PejlingSchemaType>, 'name'>) => {
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

const Correction = (props: Omit<FormInputProps<PejlingSchemaType>, 'name'>) => {
  const {isMobile} = useBreakpoints();
  const {control} = useFormContext();
  const {isWaterLevel} = useContext(CompoundPejlingContext);

  if (!isWaterLevel) return null;

  return (
    <Controller
      control={control}
      name="useforcorrection"
      rules={{required: true}}
      render={({field: {value, onChange}}) => {
        return (
          <FormControl component="fieldset">
            <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>
            <RadioGroup
              value={value + ''}
              onChange={(e) => {
                if (e.target.value == '-1') onChange(2);
                else onChange(e.target.value);
              }}
            >
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
                value={value == '0' || value == '1' || value == '3' ? -1 : value}
                control={<Radio />}
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Korrektion bagud og fremadrettet
                  </Typography>
                }
              />
              {['-1', '2', '4', '5', '6'].includes(value.toString()) && (
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
  const {notPossible, setNotPossible} = useContext(CompoundPejlingContext);
  const {setValue} = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();

  return (
    <FormControlLabel
      control={
        <Checkbox
          checked={notPossible}
          onChange={(e) => {
            setValue('measurement', e.target.checked ? null : 0);
            setValue('extrema', e.target.checked ? 'A' : undefined);
            setNotPossible(e.target.checked);
          }}
        />
      }
      label="Måling ikke mulig"
    />
  );
};

const MPAlert = ({openAddMP}: {openAddMP: () => void}) => {
  return <IngenMPAlert openAddMP={openAddMP} />;
};

const Extrema = () => {
  const {notPossible} = useContext(CompoundPejlingContext);
  const {control} = useFormContext<PejlingBoreholeSchemaType>();
  return (
    <Controller
      control={control}
      name="extrema"
      render={({field: {onChange, value}}) => {
        if (!notPossible) return <></>;
        return (
          <>
            <FormControl>
              <RadioGroup
                aria-labelledby="demo-radio-buttons-group-label"
                defaultValue=""
                value={value}
                onChange={onChange}
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
    formState: {errors},
  } = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();
  const {latestMeasurement, hide, isWaterLevel, currentMP, elevationDiff, notPossible} =
    useContext(CompoundPejlingContext);
  const pejlingOutOfRange = get(errors, 'timeofmeas')?.type == 'outOfRange';

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
  const {control, trigger} = useFormContext<PejlingBoreholeSchemaType>();
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
                trigger('pumpstop');
              }}
            />
          }
          label="Driftpejling"
        />
      )}
    />
  );
};

const PumpStop = (props: Omit<FormInputProps<PejlingBoreholeSchemaType>, 'name'>) => {
  const {watch} = useFormContext<PejlingBoreholeSchemaType>();
  const timeofmeas = watch('timeofmeas');
  const service = watch('service');
  return (
    <FormInput
      type="datetime-local"
      name="pumpstop"
      label="Tidspunkt for pumpestop"
      fullWidth
      disabled={service}
      slotProps={{
        htmlInput: {
          max: moment(timeofmeas).format('YYYY-MM-DDTHH:mm:ss'),
        },
      }}
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
