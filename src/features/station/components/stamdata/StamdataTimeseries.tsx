import {MenuItem, InputAdornment} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import {apiClient} from '~/apiClient';
import FormInput, {FormInputProps} from '~/components/FormInput';
import {dynamicSchemaType} from '../../schema';

type Props = {
  children: React.ReactNode;
  loc_name: string | undefined;
};

type timeseriesContextType = {
  loc_name: string | undefined;
};

const TimeseriesContext = React.createContext<timeseriesContextType>({
  loc_name: undefined,
});

const StamdataTimeseries = ({children, loc_name}: Props) => {
  return <TimeseriesContext.Provider value={{loc_name}}>{children}</TimeseriesContext.Provider>;
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

export default StamdataTimeseries;
