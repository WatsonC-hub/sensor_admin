import {MenuItem, InputAdornment, TextField} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {apiClient} from '~/apiClient';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {
  BoreholeAddTimeseries,
  BoreholeEditTimeseries,
  DefaultAddTimeseries,
  DefaultEditTimeseries,
} from '../../schema';
import FormTextField from '~/components/FormTextField';
import {useAppContext} from '~/state/contexts';

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
    queryKey: ['timeseries_types'],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<{tstype_id: number; tstype_name: string}>>(
        `/sensor_field/timeseries_types`
      );
      return data;
    },
  });

  const menuItems = timeseries_types
    ?.filter((i) => i.tstype_id !== 0)
    ?.map((item) => (
      <MenuItem value={item.tstype_id} key={item.tstype_id}>
        {item.tstype_name}
      </MenuItem>
    ));

  return (
    <FormInput name="tstype_id" label="Tidsserietype" select required fullWidth {...props}>
      <MenuItem disabled value={-1}>
        Vælg type
      </MenuItem>
      {menuItems}
    </FormInput>
  );
};

const TimeseriesTypeField = ({tstype_id}: {tstype_id: number | undefined}) => {
  const {data: timeseries_types} = useQuery({
    queryKey: ['timeseries_types'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
      return data;
    },
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
    queryKey: ['intake_list', boreholeno],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<{intakeno: number}>>(
        `/sensor_field/intake_list/${boreholeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && boreholeno !== null,
  });

  return (
    <FormInput<BoreholeAddTimeseries | BoreholeEditTimeseries>
      name="intakeno"
      label="Indtag"
      select
      required
      disabled={props.disabled}
      fullWidth
      {...props}
    >
      <MenuItem value={-1}>Vælg indtag</MenuItem>
      {intake_list?.map((item) => (
        <MenuItem value={item.intakeno} key={item.intakeno}>
          {item.intakeno}
        </MenuItem>
      ))}
    </FormInput>
  );
};

const Prefix = (
  props: Omit<FormInputProps<DefaultAddTimeseries | DefaultEditTimeseries>, 'name'> & {
    loc_name: string | undefined;
  }
) => {
  // const {loc_name} = React.useContext(TimeseriesContext);
  const loc_name = props.loc_name;
  return (
    <FormInput
      name="prefix"
      label="Navn"
      InputProps={{
        startAdornment: (
          <InputAdornment position="start">
            {loc_name !== undefined && loc_name + ' - '}
          </InputAdornment>
        ),
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
StamdataTimeseries.TimeseriesID = TimeseriesID;

export default StamdataTimeseries;
