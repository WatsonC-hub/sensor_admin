import {MenuItem, InputAdornment} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {apiClient} from '~/apiClient';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {BoreholeAddTimeseries, BoreholeEditTimeseries, DynamicSchemaType} from '../../schema';
import FormTextField from '~/components/FormTextField';

type Props = {
  children: React.ReactNode;
  boreholeno?: string | undefined;
};

type TimeseriesContextType = {
  boreholeno?: string | undefined;
};

const TimeseriesContext = React.createContext<TimeseriesContextType>({
  boreholeno: undefined,
});

const StamdataTimeseries = ({children, boreholeno}: Props) => {
  return <TimeseriesContext.Provider value={{boreholeno}}>{children}</TimeseriesContext.Provider>;
};

const TypeSelect = (props: Omit<FormInputProps<DynamicSchemaType>, 'name'>) => {
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
    enabled: boreholeno !== undefined,
  });

  return (
    <FormInput<BoreholeAddTimeseries | BoreholeEditTimeseries>
      name="intakeno"
      label="Intagnummer"
      select
      required
      disabled={props.disabled}
      fullWidth
      {...props}
    >
      <MenuItem value={-1}>Vælg intag</MenuItem>
      {intake_list?.map((item) => (
        <MenuItem value={item.intakeno} key={item.intakeno}>
          {item.intakeno}
        </MenuItem>
      ))}
    </FormInput>
  );
};

const Prefix = (
  props: Omit<FormInputProps<DynamicSchemaType>, 'name'> & {loc_name: string | undefined}
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

const SensorDepth = (props: Omit<FormInputProps<DynamicSchemaType>, 'name'>) => {
  return (
    <FormInput
      type="number"
      label="Evt. loggerdybde under målepunkt"
      name="sensor_depth_m"
      disabled={props.disabled}
      fullWidth
      InputProps={{
        endAdornment: <InputAdornment position="start">m</InputAdornment>,
      }}
      {...props}
    />
  );
};

StamdataTimeseries.TypeSelect = TypeSelect;
StamdataTimeseries.TimeriesTypeField = TimeseriesTypeField;
StamdataTimeseries.Prefix = Prefix;
StamdataTimeseries.SensorDepth = SensorDepth;
StamdataTimeseries.Intakeno = Intakeno;

export default StamdataTimeseries;
