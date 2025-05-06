import {Grid2, InputAdornment, MenuItem, TextField} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FormInput from '~/components/FormInput';
import FormTextField from '~/components/FormTextField';
import {useAppContext} from '~/state/contexts';

interface TimeseriesTypeSelectProps {
  stationTypes: Array<{tstype_id: number; tstype_name: string}>;
  disabled: boolean;
}

const TimeseriesTypeSelect = ({stationTypes, disabled = false}: TimeseriesTypeSelectProps) => {
  const menuItems = stationTypes
    ?.filter((i) => i.tstype_id !== 0)
    ?.map((item) => (
      <MenuItem value={item.tstype_id} key={item.tstype_id}>
        {item.tstype_name}
      </MenuItem>
    ));

  return (
    <FormInput
      name="timeseries.tstype_id"
      label="Tidsserietype"
      disabled={disabled}
      select
      required
      fullWidth
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </FormInput>
  );
};

interface TimeseriesFormProps {
  mode: string;
  disabled?: boolean;
}

export default function TimeseriesForm({mode, disabled = false}: TimeseriesFormProps) {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: timeseries_types} = useQuery({
    queryKey: ['timeseries_types'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/timeseries_types`);
      return data;
    },
  });

  const {watch, unregister} = useFormContext();

  const loc_name = watch('location.loc_name');
  const tstype_id = watch('timeseries.tstype_id');

  useEffect(() => {
    if (mode === 'add' && tstype_id !== 1) {
      unregister('watlevmp');
    }
  }, [tstype_id]);

  return (
    // <FormProvider {...formMethods}>
    <Grid2 container spacing={2}>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormInput
          name="timeseries.prefix"
          label="Navn"
          disabled={disabled}
          InputProps={{
            startAdornment: <InputAdornment position="start">{loc_name + ' - '}</InputAdornment>,
          }}
          placeholder="f.eks. indtag 1"
          fullWidth
        />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        {mode === 'add' ? (
          <TimeseriesTypeSelect stationTypes={timeseries_types} disabled={disabled} />
        ) : (
          <FormTextField
            disabled
            label="Tidsserie type"
            value={
              timeseries_types?.filter(
                (elem: {tstype_id: number; tstype_name: string}) => elem.tstype_id == tstype_id
              )[0]?.tstype_name
            }
          />
        )}
      </Grid2>
      {mode === 'add' && tstype_id === 1 && (
        <>
          <Grid2 size={{xs: 12, sm: 6, md: 2}}>
            <FormInput
              type="number"
              label="Målepunktskote"
              name="watlevmp.elevation"
              required
              disabled={disabled}
              fullWidth
              InputProps={{
                endAdornment: <InputAdornment position="start">m</InputAdornment>,
              }}
            />
          </Grid2>
          <Grid2 size={{xs: 12, sm: 6, md: 4}}>
            <FormInput
              label="Målepunkt placering"
              name="watlevmp.description"
              disabled={disabled}
              required
              fullWidth
              placeholder="f.eks. top af rør"
            />
          </Grid2>
        </>
      )}
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormInput
          type="number"
          label="Evt. loggerdybde under målepunkt"
          name="timeseries.sensor_depth_m"
          disabled={disabled}
          fullWidth
          InputProps={{
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
        />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}} alignContent={'center'} alignItems="center">
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
      </Grid2>
    </Grid2>
  );
}
