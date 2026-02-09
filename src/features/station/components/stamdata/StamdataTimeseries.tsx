import {InputAdornment, TextField, FormControlLabel, Checkbox, Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {apiClient} from '~/apiClient';
import {PhotoCameraRounded} from '@mui/icons-material';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {
  BoreholeAddTimeseries,
  BoreholeEditTimeseries,
  DefaultAddTimeseries,
  DefaultEditTimeseries,
} from '../../schema';
import FormTextField from '~/components/FormTextField';
import {useAppContext} from '~/state/contexts';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import {Controller, useFormContext} from 'react-hook-form';
import Button from '~/components/Button';

import ConfirmCalypsoIDDialog from '~/pages/field/boreholeno/components/ConfirmCalypsoIDDialog';
import CaptureDialog from '~/components/CaptureDialog';
import {toast} from 'react-toastify';

type Props = {
  children: React.ReactNode;
  boreholeno?: string | null;
};

type TimeseriesContextType = {
  boreholeno?: string | null;
};

const TimeseriesContext = React.createContext<TimeseriesContextType>({
  boreholeno: undefined,
});

const StamdataTimeseries = ({children, boreholeno}: Props) => {
  return <TimeseriesContext.Provider value={{boreholeno}}>{children}</TimeseriesContext.Provider>;
};

const TypeSelect = (
  props: Omit<FormInputProps<DefaultAddTimeseries | BoreholeAddTimeseries>, 'name'>
) => {
  const {data: timeseries_types} = useQuery({
    queryKey: queryKeys.timeseriesTypes(),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<{tstype_id: number; tstype_name: string}>>(
        `/sensor_field/timeseries_types`
      );
      return data;
    },
    staleTime: Infinity, // Cache indefinitely
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch every 24 hours
  });

  return (
    <FormInput
      name="tstype_id"
      label="Tidsserietype"
      select
      placeholder="Vælg type"
      options={timeseries_types
        ?.filter((type) => type.tstype_id !== 0)
        .map((type) => ({[type.tstype_id]: type.tstype_name}))}
      keyType="number"
      required
      fullWidth
      {...props}
    />
  );
};

const TimeseriesTypeField = ({tstype_id}: {tstype_id: number | undefined}) => {
  const {data: timeseries_types} = useQuery({
    queryKey: queryKeys.timeseriesTypes(),
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
      return data;
    },
    staleTime: Infinity, // Cache indefinitely
    refetchInterval: 1000 * 60 * 60 * 24, // Refetch every 24 hours
  });

  return (
    <FormTextField
      disabled
      label="Tidsserie type"
      value={
        timeseries_types?.filter(
          (elem: {tstype_id: number; tstype_name: string}) => elem.tstype_id == tstype_id
        )[0]?.tstype_name
      }
    />
  );
};

const Intakeno = (
  props: Omit<FormInputProps<BoreholeAddTimeseries | BoreholeEditTimeseries>, 'name'>
) => {
  const {boreholeno} = React.useContext(TimeseriesContext);

  const {data: intake_list} = useQuery({
    queryKey: queryKeys.Borehole.intakeList(boreholeno),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<{intakeno: number}>>(
        `/sensor_field/intake_list/${boreholeno}`
      );
      return data;
    },
    staleTime: 1000 * 60 * 5, // 5 minutes
    enabled: boreholeno !== undefined && boreholeno !== null,
  });

  return (
    <FormInput<BoreholeAddTimeseries | BoreholeEditTimeseries>
      name="intakeno"
      label="Indtag"
      select
      required
      infoText="Vælg først et DGU nummer først"
      disabled={props.disabled || !boreholeno}
      placeholder="Vælg indtag"
      options={intake_list?.map((item) => ({[item.intakeno]: item.intakeno}))}
      keyType="number"
      fullWidth
      {...props}
    />
  );
};

const Prefix = ({
  loc_name,
  ...props
}: Omit<FormInputProps<DefaultAddTimeseries | DefaultEditTimeseries>, 'name'> & {
  loc_name: string | undefined;
}) => {
  return (
    <FormInput
      name="prefix"
      label="Navn"
      slotProps={{
        input: {
          startAdornment: (
            <InputAdornment position="start">
              {loc_name !== undefined && loc_name !== '' && loc_name + ' - '}
            </InputAdornment>
          ),
        },
      }}
      placeholder="f.eks. indtag 1"
      fullWidth
      {...props}
    />
  );
};

const SensorDepth = (
  props: Omit<
    FormInputProps<
      DefaultAddTimeseries | DefaultEditTimeseries | BoreholeAddTimeseries | BoreholeEditTimeseries
    >,
    'name'
  >
) => {
  return (
    <FormInput
      type="number"
      label="Evt. loggerdybde under målepunkt"
      name="sensor_depth_m"
      disabled={props.disabled}
      fullWidth
      slotProps={{
        input: {
          endAdornment: <InputAdornment position="start">m</InputAdornment>,
        },
      }}
      {...props}
    />
  );
};

const RequiresAuth = () => {
  const {control} = useFormContext();
  return (
    <Controller
      name="requires_auth"
      control={control}
      render={({field: {onChange, value}}) => (
        <FormControlLabel
          control={<Checkbox sx={{p: 0, ml: 1}} onChange={onChange} checked={value} />}
          label="Kræver rettigheder for at se tidsserien"
        />
      )}
    />
  );
};

const HidePublic = () => {
  const {control} = useFormContext();
  return (
    <Controller
      name="hide_public"
      control={control}
      render={({field: {onChange, value}}) => (
        <FormControlLabel
          control={<Checkbox sx={{p: 0, ml: 1}} onChange={onChange} checked={value} />}
          label="Skjul i offentlige visninger"
        />
      )}
    />
  );
};

type ScanCalypsoLabelProps = {
  disabled?: boolean;
};

const ScanCalypsoLabel = ({disabled}: ScanCalypsoLabelProps) => {
  const [openCamera, setOpenCamera] = React.useState(false);
  const [openDialog, setOpenDialog] = React.useState(false);
  const [calypso_id, setCalypso_id] = React.useState<number | null>(null);
  const {setValue, watch} = useFormContext();
  const calypso_id_watch = watch('calypso_id');

  const handleScan = async (data: any, calypso_id: number | null) => {
    if (calypso_id) {
      setCalypso_id(calypso_id);
      setOpenCamera(false);
      setOpenDialog(true);
    } else {
      toast.error('QR-koden er ikke gyldig', {autoClose: 2000});
    }
  };

  return (
    <Box
      display="flex"
      gap={1}
      flexDirection="row"
      alignItems="center"
      justifyContent="space-between"
    >
      <FormInput label="Calypso ID" name="calypso_id" disabled fullWidth />
      <Button
        sx={{width: '80%', textTransform: 'initial', borderRadius: 15}}
        bttype="primary"
        color="primary"
        startIcon={<PhotoCameraRounded />}
        onClick={() => setOpenCamera(true)}
        disabled={disabled}
      >
        {calypso_id_watch ? 'Skift ID' : 'Tilføj ID'}
      </Button>
      {openCamera && (
        <CaptureDialog
          open={openCamera}
          handleClose={() => setOpenCamera(false)}
          handleScan={handleScan}
        />
      )}
      {openDialog && (
        <ConfirmCalypsoIDDialog
          open={openDialog}
          setOpen={setOpenDialog}
          onConfirm={() => {
            setValue('calypso_id', Number(calypso_id), {
              shouldValidate: true,
              shouldDirty: true,
            });
          }}
          calypso_id={calypso_id}
        />
      )}
    </Box>
  );
};

const TimeseriesID = () => {
  const {ts_id} = useAppContext(['ts_id']);
  return (
    <TextField
      value={ts_id}
      disabled
      slotProps={{
        inputLabel: {
          shrink: true,
        },
      }}
      fullWidth
      label="Tidsserie ID"
      sx={{
        pb: 0.6,
        '& .MuiInputBase-input.Mui-disabled': {
          WebkitTextFillColor: '#000000',
        },
        '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
        '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
        '& .MuiOutlinedInput-root': {
          '& > fieldset': {borderColor: 'primary.main'},
        },
        '.MuiFormHelperText-root': {
          position: 'absolute',
          top: 'calc(100% - 8px)',
        },
      }}
    />
  );
};

StamdataTimeseries.TypeSelect = TypeSelect;
StamdataTimeseries.TimeriesTypeField = TimeseriesTypeField;
StamdataTimeseries.Prefix = Prefix;
StamdataTimeseries.SensorDepth = SensorDepth;
StamdataTimeseries.Intakeno = Intakeno;
StamdataTimeseries.ScanCalypsoLabel = ScanCalypsoLabel;
StamdataTimeseries.TimeseriesID = TimeseriesID;
StamdataTimeseries.RequiresAuth = RequiresAuth;
StamdataTimeseries.HidePublic = HidePublic;

export default StamdataTimeseries;
