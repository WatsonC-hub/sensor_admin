import SaveIcon from '@mui/icons-material/Save';
import {Box, Typography, FormControlLabel, Checkbox} from '@mui/material';
import {RESET} from 'jotai/utils';
import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';

import type {Filter} from './SearchAndFilter';

interface FilterOptionsProps {
  filters: Filter;
  setFilter: (filter: Filter | typeof RESET) => void;
}

const FilterOptions = ({filters, setFilter}: FilterOptionsProps) => {
  const formMethods = useForm<Filter>({
    values: filters,
  });

  const submit = (data: Filter) => {
    setFilter(data);
  };

  const reset = () => {
    formMethods.reset();
    setFilter(RESET);
  };

  return (
    <FormProvider {...formMethods}>
      <FormInput name="freeText" label="Fritekst filtrering" />
      <FormControlLabel
        control={
          <Controller
            control={formMethods.control}
            name="sensor.showInactive"
            render={({field: {value, ...field}}) => <Checkbox {...field} checked={!!value} />}
          />
        }
        label={<Typography variant="body2">Vis inaktive</Typography>}
      />
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 1,
        }}
      >
        <Button bttype="tertiary" onClick={reset}>
          Nulstil
        </Button>

        <Button
          bttype="primary"
          onClick={formMethods.handleSubmit(submit)}
          startIcon={<SaveIcon />}
        >
          Gem
        </Button>
      </Box>
    </FormProvider>
  );
};

export default FilterOptions;
