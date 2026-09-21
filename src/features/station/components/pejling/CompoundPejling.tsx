import {
  Typography,
  InputAdornment,
  FormControl,
  FormControlLabel,
  FormLabel,
  Radio,
  RadioGroup,
  Checkbox,
  TextField,
  MenuItem,
} from '@mui/material';
import React, {useContext, useEffect, useState} from 'react';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {PejlingBoreholeSchemaType, PejlingSchemaType} from './PejlingSchema';
import {Controller, useFormContext} from 'react-hook-form';
import {getCorrectionMode, SCALE_CORRECTION_PICK_ON_GRAPH_VALUE} from './correctionMode';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import IngenMPAlert from '~/features/pejling/components/IngenMPAlert';
import Button from '~/components/Button';
import {Save} from '@mui/icons-material';
import {useAtom} from 'jotai';
import {
  boreholeIsPumpAtom,
  pejlingCorrectionDateSelectionAtom,
  pejlingPickCorrectionDateModeAtom,
} from '~/state/atoms';
import {LatestMeasurement, MaalepunktAsDayjs} from '~/types';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {get} from 'lodash';
import DisplayWaterlevelAlert from '~/features/pejling/components/WaterlevelAlert';
import TooltipWrapper from '~/components/TooltipWrapper';
import FormDateTime, {FormDateTimeProps} from '~/components/FormDateTime';
import {useAppContext} from '~/state/contexts';
import dayjs from 'dayjs';
import {toast} from 'react-toastify';

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
  isFlow?: boolean;
  currentMP?: MaalepunktAsDayjs | null;
  elevationDiff?: number;
  notPossible: boolean;
  setNotPossible: (notPossible: boolean) => void;
  correction_type: 'scale' | 'translation' | null | undefined;
  calculate_function?: string | null;
  calculated?: boolean;
}

const CompoundPejlingContext = React.createContext<CompoundPejlingProps>({
  submit: () => {},
  cancel: () => {},
  openAddMP: () => {},
  setDynamic: () => {},
  latestMeasurement: undefined,
  hide: false,
  isWaterLevel: false,
  isFlow: false,
  currentMP: null,
  elevationDiff: 0,
  notPossible: false,
  correction_type: undefined,
  calculate_function: undefined,
  calculated: undefined,
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
  const {ts_id} = useAppContext(['ts_id']);
  const timeofmeas = watch('timeofmeas');
  const measurement = watch('measurement');
  const [notPossible, setNotPossible] = useState<boolean>(!!getValues('extrema'));

  const {data: timeseries} = useTimeseriesData();
  const correction_type = timeseries?.correction_type;
  const calculate_function = timeseries?.calculate_function;
  const calculated = timeseries?.calculated;
  const isWaterLevel = timeseries?.tstype_id === 1;
  const isFlow = timeseries?.tstype_id === 2;
  const [elevationDiff, setElevationDiff] = useState<number | undefined>(undefined);
  const [hide, setHide] = useState<boolean>(false);
  const [currentMP, setCurrentMP] = useState<MaalepunktAsDayjs | null>(null);
  const tstype_id = timeseries?.tstype_id;
  const {
    get: {data: mpData},
  } = useMaalepunkt(ts_id);

  useEffect(() => {
    let latestmeas: number | undefined = undefined;
    let dynamicMeas: number | undefined = undefined;
    if (timeofmeas == null) {
      setDynamic([]);
      setHide(true);
      setCurrentMP(null);
      setElevationDiff(undefined);
      return;
    }

    const formattedTimeofMeas = timeofmeas.format('YYYY-MM-DD HH:mm');
    if (isWaterLevel && mpData !== undefined && mpData.length > 0) {
      const mp = mpData
        .filter((elem) => {
          if (timeofmeas.isSameOrAfter(elem.startdate)) {
            return true;
          }
        })
        .sort((a, b) => b.startdate.diff(a.startdate));

      const internalCurrentMP = mp.length > 0 ? mp[0] : null;
      setCurrentMP(internalCurrentMP);

      if (internalCurrentMP) {
        dynamicMeas = internalCurrentMP.elevation - Number(measurement);
        setDynamic([formattedTimeofMeas, dynamicMeas]);
        latestmeas = latestMeasurement?.measurement;

        const diff = timeofmeas.diff(latestMeasurement?.timeofmeas, 'days');
        setHide(Math.abs(diff) > 1);
      } else {
        setDynamic([]);
        setHide(true);
      }
    } else {
      dynamicMeas = Number(measurement);
      setDynamic([formattedTimeofMeas, dynamicMeas]);
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
        isFlow,
        correction_type,
        calculate_function,
        calculated,
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
    formState: {errors, isDirty, isSubmitting},
  } = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();
  return (
    <Button
      bttype="primary"
      fullWidth={false}
      startIcon={isSubmitting ? undefined : <Save />}
      disabled={Object.keys(errors).length > 0 || !isDirty}
      loading={isSubmitting}
      onClick={handleSubmit(submit, (errors) => console.log(errors))}
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
      slotProps={{
        input: {
          endAdornment: (
            <InputAdornment position="start">{isWaterLevel ? 'm' : stationUnit}</InputAdornment>
          ),
        },
      }}
      fullWidth
      {...props}
    />
  );
};

const TimeOfMeas = (
  props: Omit<FormDateTimeProps<PejlingSchemaType | PejlingBoreholeSchemaType>, 'name'>
) => {
  const {watch, trigger} = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();
  const service = watch('service');

  return (
    <FormDateTime<PejlingSchemaType | PejlingBoreholeSchemaType>
      name="timeofmeas"
      label="Dato"
      onChangeCallback={() => {
        if (!service) {
          trigger('pumpstop');
        }
      }}
      required
      openTo="hours"
      {...props}
    />
  );

  // return (
  //   <FormInput
  //     name="timeofmeas"
  //     label="Dato"
  //     fullWidth
  //     type="datetime-local"
  //     onChangeCallback={() => {
  //       if (!service) {
  //         trigger('pumpstop');
  //       }
  //     }}
  //     required
  //     sx={{mb: 2}}
  //     {...props}
  //   />
  // );
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

const CORRECTION_DATE_TOAST_ID = 'pejling-correction-date';

const CORRECTION_SUB_OPTION_LABELS: Record<number, string> = {
  2: 'Til start af tidsserie',
  4: 'Til start af udstyr',
  5: 'Til niveau spring',
  6: 'Til forrige korrigerende pejling',
  [SCALE_CORRECTION_PICK_ON_GRAPH_VALUE]: 'Til brugerdefineret dato',
};

const correctionConfigByType: Record<
  'translation' | 'scale',
  {bagudrettetLabel: string; subOptionValues: number[]}
> = {
  translation: {
    bagudrettetLabel: 'Korrektion fremad og bagudrettet',
    subOptionValues: [2, 4, 5, 6, SCALE_CORRECTION_PICK_ON_GRAPH_VALUE],
  },
  scale: {
    bagudrettetLabel: 'Lineær korrektion fremad og bagudrettet',
    subOptionValues: [2, 4, 6, SCALE_CORRECTION_PICK_ON_GRAPH_VALUE],
  },
};

const Correction = (props: Omit<FormInputProps<PejlingSchemaType>, 'name'>) => {
  const {correction_type, isFlow, calculate_function, calculated} =
    useContext(CompoundPejlingContext);
  const mode = getCorrectionMode({correction_type, isFlow, calculate_function, calculated});

  switch (mode) {
    case 'hidden':
      return null;
    case 'simple_correction':
      return <SimpleCorrection {...props} />;
    case 'translation':
    case 'scale':
      return <FullCorrection {...props} />;
  }
};

const SimpleCorrection = (props: Omit<FormInputProps<PejlingSchemaType>, 'name'>) => {
  const {isMobile} = useBreakpoints();
  const {control} = useFormContext();

  return (
    <Controller
      control={control}
      name="useforcorrection"
      rules={{required: true}}
      render={({field: {value, onChange}, fieldState: {error}}) => {
        return (
          <FormControl component="fieldset">
            <TooltipWrapper
              description="Anvendelsen af en pejling er et vigtigt aspekt af at få en korrekt kotesat vandstand. Læs mere på linket hvis du er i tvivl om hvad anvendelserne gør."
              url="https://www.watsonc.dk/guides/kontrolpejling/#anvendelsestyper"
            >
              <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>{' '}
            </TooltipWrapper>
            <RadioGroup value={value + ''} onChange={(e) => onChange(e.target.value)}>
              <FormControlLabel
                value={0}
                control={<Radio />}
                label={<Typography variant={isMobile ? 'body2' : 'body1'}>Kontrol</Typography>}
              />
              <FormControlLabel
                value={1}
                control={<Radio />}
                label={<Typography variant={isMobile ? 'body2' : 'body1'}>Korrektion</Typography>}
              />
            </RadioGroup>
            {error && (
              <Typography variant="caption" color="error">
                {error.message}
              </Typography>
            )}
          </FormControl>
        );
      }}
      {...props}
    />
  );
};

const FullCorrection = (props: Omit<FormInputProps<PejlingSchemaType>, 'name'>) => {
  const {isMobile} = useBreakpoints();
  const {control, setValue} = useFormContext();
  const {correction_type} = useContext(CompoundPejlingContext);

  const {bagudrettetLabel, subOptionValues} =
    correctionConfigByType[correction_type === 'scale' ? 'scale' : 'translation'];
  const subOptions = subOptionValues.map((value) => ({
    value,
    label: CORRECTION_SUB_OPTION_LABELS[value],
  }));

  return (
    <Controller
      control={control}
      name="useforcorrection"
      rules={{required: true}}
      render={({field: {value, onChange}, fieldState: {error}}) => {
        const isExpanded =
          value.toString() === '-1' || subOptions.some((option) => option.value === Number(value));

        const handleUseforcorrectionChange = (newValue: number) => {
          onChange(newValue);
          if (newValue !== SCALE_CORRECTION_PICK_ON_GRAPH_VALUE) {
            setValue('correction_date', null, {shouldDirty: true});
          }
        };

        return (
          <FormControl component="fieldset">
            <TooltipWrapper
              description="Anvendelsen af en pejling er et vigtigt aspekt af at få en korrekt kotesat vandstand. Læs mere på linket hvis du er i tvivl om hvad anvendelserne gør."
              url="https://www.watsonc.dk/guides/kontrolpejling/#anvendelsestyper"
            >
              <FormLabel>Hvordan skal pejlingen anvendes?</FormLabel>{' '}
            </TooltipWrapper>
            <RadioGroup
              value={value + ''}
              onChange={(e) => {
                if (e.target.value == '-1') handleUseforcorrectionChange(2);
                else handleUseforcorrectionChange(Number(e.target.value));
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
                  <Typography variant={isMobile ? 'body2' : 'body1'}>{bagudrettetLabel}</Typography>
                }
              />
            </RadioGroup>
            {isExpanded && (
              <TextField
                select
                label="Vælg korrektionstype"
                value={
                  subOptions.some((option) => option.value === Number(value)) ? Number(value) : ''
                }
                onChange={(e) => handleUseforcorrectionChange(Number(e.target.value))}
                fullWidth
                margin="dense"
                sx={{maxWidth: 400, mt: 1}}
                slotProps={{
                  inputLabel: {
                    sx: {
                      color: 'primary.main',
                    },
                  },
                  select: {
                    sx: {
                      '& > fieldset': {
                        borderColor: 'primary.main',
                      },
                    },
                  },
                }}
              >
                {subOptions.map((option) => (
                  <MenuItem key={option.value} value={option.value}>
                    {option.label}
                  </MenuItem>
                ))}
              </TextField>
            )}
            {error && (
              <Typography variant="caption" color="error">
                {error.message}
              </Typography>
            )}
            {Number(value) === SCALE_CORRECTION_PICK_ON_GRAPH_VALUE && <CorrectionDate />}
          </FormControl>
        );
      }}
      {...props}
    />
  );
};

const CorrectionDate = () => {
  const {setValue, watch} = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();
  const timeofmeas = watch('timeofmeas');
  const [pickMode, setPickMode] = useAtom(pejlingPickCorrectionDateModeAtom);
  const [selection, setSelection] = useAtom(pejlingCorrectionDateSelectionAtom);

  useEffect(() => {
    if (selection && selection.length > 0) {
      const pickedDate = dayjs(selection[0].x);
      setSelection(undefined);
      setPickMode(false);
      toast.dismiss(CORRECTION_DATE_TOAST_ID);

      if (timeofmeas && pickedDate.isAfter(timeofmeas)) {
        toast.error('Dato kan ikke være efter kontroltidspunktet');
        return;
      }

      setValue('correction_date', pickedDate, {
        shouldDirty: true,
        shouldTouch: true,
        shouldValidate: true,
      });
    }
  }, [selection]);

  useEffect(() => {
    return () => {
      setPickMode(false);
      setSelection(undefined);
      toast.dismiss(CORRECTION_DATE_TOAST_ID);
    };
  }, [setPickMode, setSelection]);

  return (
    <FormDateTime
      name="correction_date"
      label="Korriger fra dato"
      maxDate={timeofmeas}
      customActionLabel="Vælg på graf"
      customActionDisabled={pickMode}
      customAction={() => {
        setPickMode(true);
        toast('Klik på et punkt i grafen for at vælge dato', {
          toastId: CORRECTION_DATE_TOAST_ID,
          type: 'info',
          autoClose: false,
          closeOnClick: true,
          draggable: true,
        });
      }}
    />
  );
};

const NotPossible = () => {
  const {notPossible, setNotPossible} = useContext(CompoundPejlingContext);
  const {setValue} = useFormContext<PejlingSchemaType | PejlingBoreholeSchemaType>();

  return (
    <TooltipWrapper
      withIcon={false}
      description="Dette bruges til at dokumentere hvorvidt en pejling har været umuligt grundet eks. overtryk eller tørlægning."
    >
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
    </TooltipWrapper>
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
              checked={value ?? false}
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

const PumpStop = (
  props: Omit<FormDateTimeProps<PejlingSchemaType | PejlingBoreholeSchemaType>, 'name'>
) => {
  const {watch} = useFormContext<PejlingBoreholeSchemaType>();
  const timeofmeas = watch('timeofmeas');
  const service = watch('service');

  return (
    <FormDateTime<PejlingSchemaType | PejlingBoreholeSchemaType>
      name="pumpstop"
      label="Tidspunkt for pumpestop"
      disabled={!!service}
      rules={{required: !service}}
      maxDate={timeofmeas}
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
