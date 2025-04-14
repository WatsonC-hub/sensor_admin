import {MenuItem, InputAdornment} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {apiClient} from '~/apiClient';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {BoreholeAddTimeseries, BoreholeEditTimeseries, dynamicSchemaType} from '../../schema';

type Props = {
  children: React.ReactNode;
  loc_name: string | undefined;
  boreholeno: string | undefined;
};

type timeseriesContextType = {
  loc_name: string | undefined;
  boreholeno: string | undefined;
};

const TimeseriesContext = React.createContext<timeseriesContextType>({
  loc_name: undefined,
  boreholeno: undefined,
});

const StamdataTimeseries = ({children, loc_name, boreholeno}: Props) => {
  return (
    <TimeseriesContext.Provider value={{loc_name, boreholeno}}>
      {children}
    </TimeseriesContext.Provider>
  );
};

interface TimeseriesTypeSelectProps {
  stationTypes: Array<{tstype_id: number; tstype_name: string}>;
  disabled?: boolean;
}

const TimeseriesTypeSelect = ({
  stationTypes,
  disabled = false,
  ...props
}: TimeseriesTypeSelectProps) => {
  const menuItems = stationTypes
    ?.filter((i) => i.tstype_id !== 0)
    ?.map((item) => (
      <MenuItem value={item.tstype_id} key={item.tstype_id}>
        {item.tstype_name}
      </MenuItem>
    ));

  return (
    <FormInput
      name="tstype_id"
      label="Tidsserietype"
      disabled={disabled}
      select
      required
      fullWidth
      {...props}
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </FormInput>
  );
};

const TypeSelect = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {data: timeseries_types} = useQuery({
    queryKey: ['timeseries_types'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
      return data;
    },
  });

  return <TimeseriesTypeSelect stationTypes={timeseries_types} {...props} />;
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

const Prefix = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
  const {loc_name} = React.useContext(TimeseriesContext);
  return (
    <FormInput
      name="prefix"
      label="Navn"
      InputProps={{
        startAdornment: <InputAdornment position="start">{loc_name + ' - '}</InputAdornment>,
      }}
      placeholder="f.eks. indtag 1"
      fullWidth
      {...props}
    />
  );
};

const SensorDepth = (props: Omit<FormInputProps<dynamicSchemaType>, 'name'>) => {
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
StamdataTimeseries.Prefix = Prefix;
StamdataTimeseries.SensorDepth = SensorDepth;
StamdataTimeseries.Intakeno = Intakeno;

export default StamdataTimeseries;
