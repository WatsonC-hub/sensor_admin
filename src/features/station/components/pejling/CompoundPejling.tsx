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
import React from 'react';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {PejlingBoreholeItem, PejlingItem} from './PejlingSchema';
import {Controller, useFormContext} from 'react-hook-form';
import {correction_map} from '~/consts';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {Maalepunkt} from '~/types';
import IngenMPAlert from '~/features/pejling/components/IngenMPAlert';
import Button from '~/components/Button';
import {Save} from '@mui/icons-material';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAtom, useSetAtom} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';

type PejlingProps = {
  children?: React.ReactNode;
};

const CompoundPejling = ({children}: PejlingProps) => {
  return <div>{children}</div>;
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

const SubmitButton = ({submit}: {submit: (values: PejlingItem | PejlingBoreholeItem) => void}) => {
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

const Measurement = (
  props: Omit<FormInputProps<PejlingItem>, 'name'> & {currentMP: Maalepunkt | null}
) => {
  const {data: metadata} = useTimeseriesData();
  const {watch} = useFormContext<PejlingItem>();
  const notPossible = watch('notPossible');
  const isWaterLevel = metadata?.tstype_id === 1;
  const stationUnit = metadata?.unit;
  const {currentMP} = props;

  return (
    <FormInput
      type="number"
      name="measurement"
      label={
        <Typography variant="h5" component="h3">
          {isWaterLevel ? 'Pejling (nedstik)' : 'Måling'}
        </Typography>
      }
      InputProps={{
        endAdornment: (
          <InputAdornment position="start">{isWaterLevel ? 'm' : stationUnit}</InputAdornment>
        ),
      }}
      fullWidth
      disabled={notPossible || (isWaterLevel && currentMP == null)}
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
                value="0"
                control={<Radio />}
                label={<Typography variant={isMobile ? 'body2' : 'body1'}>Kontrol</Typography>}
              />
              <FormControlLabel
                value="1"
                control={<Radio />}
                label={
                  <Typography variant={isMobile ? 'body2' : 'body1'}>
                    Korrektion fremadrettet
                  </Typography>
                }
              />
              <FormControlLabel
                value="-1"
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
      {...props}
    />
  );
};

const NotPossible = () => {
  const {control, setValue} = useFormContext<PejlingItem>();
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
                setValue('measurement', null);
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
      render={({field, fieldState}) => {
        console.log(fieldState?.error?.message);
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

const IsPump = () => {
  const [isPump, setIsPump] = useAtom(boreholeIsPumpAtom);
  const {setValue} = useFormContext<PejlingBoreholeItem>();

  return (
    <FormControlLabel
      control={
        <Checkbox
          sx={{color: 'primary.main'}}
          checked={isPump}
          onChange={(e) => {
            setIsPump(e.target.checked);
            setValue('disttowatertable_m', null);
          }}
        />
      }
      label="Pumpeboring"
    />
  );
};

const DistToWaterTable = (props: Omit<FormInputProps<PejlingBoreholeItem>, 'name'>) => {
  return (
    <FormInput
      type="number"
      name="disttowatertable_m"
      label="Pejling (nedstik)"
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="start">m</InputAdornment>,
        },
      }}
      fullWidth
      {...props}
    />
  );
};

const Service = () => {
  const {control, setValue} = useFormContext<PejlingBoreholeItem>();
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
                setValue('disttowatertable_m', null);
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
CompoundPejling.CancelButton = CancelButton;
CompoundPejling.SubmitButton = SubmitButton;
CompoundPejling.Extrema = Extrema;
CompoundPejling.IsPump = IsPump;
CompoundPejling.DistToWaterTable = DistToWaterTable;
CompoundPejling.Service = Service;
CompoundPejling.PumpStop = PumpStop;

export default CompoundPejling;
