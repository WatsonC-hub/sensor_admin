import SaveIcon from '@mui/icons-material/Save';
import {Box, Typography, FormControlLabel, Checkbox, Divider} from '@mui/material';
import {RESET} from 'jotai/utils';
import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';

import NotificationIcon from './NotificationIcon';
import type {Filter} from './SearchAndFilterMap';

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
      <Typography variant="h6">Filtrer lokationer</Typography>
      <FormInput name="freeText" label="Fritekst filtrering" />
      <Divider />
      <Typography variant="subtitle1">Status</Typography>
      <FormControlLabel
        control={
          <Controller
            control={formMethods.control}
            name="sensor.showInactive"
            render={({field: {value, ...field}}) => <Checkbox {...field} checked={!!value} />}
          />
        }
        label={
          <Typography
            variant="body1"
            sx={{
              display: 'flex',
              gap: 1,
              alignItems: 'center',
            }}
          >
            <NotificationIcon iconDetails={{color: 'grey'}} />
            Inaktiv
          </Typography>
        }
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
