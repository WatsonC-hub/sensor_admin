import SaveIcon from '@mui/icons-material/Save';
import {Box, Typography, FormControlLabel, Checkbox, Divider, Grid} from '@mui/material';
import {RESET} from 'jotai/utils';
import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import FormToggleGroup from '~/components/FormToggleGroup';
import LocationGroups from '~/pages/field/stamdata/components/LocationGroups';
import {authStore} from '~/state/store';

import {Filter, defaultMapFilter} from './filter_consts';
import NotificationIcon from './NotificationIcon';

interface FilterOptionsProps {
  filters: Filter;
  onSubmit: (filter: Filter | typeof RESET) => void;
}

const FilterOptions = ({filters, onSubmit}: FilterOptionsProps) => {
  const [boreholeAccess, iotAccess, superUser] = authStore((state) => [
    state.boreholeAccess,
    state.iotAccess,
    state.superUser,
  ]);

  const formMethods = useForm<Filter>({
    values: filters,
  });

  const submit = (data: Filter) => {
    onSubmit(data);
  };

  const reset = () => {
    const mapFilter: Filter = {
      ...defaultMapFilter,
      sensor: {
        ...defaultMapFilter.sensor,
        isCustomerService: superUser ? false : true,
      },
    };

    formMethods.reset(mapFilter);
    onSubmit(mapFilter);
  };

  return (
    <FormProvider {...formMethods}>
      <Typography variant="h6">Filtrer lokationer</Typography>
      <FormInput
        name="freeText"
        label="Fritekst filtrering"
        placeholder="Indtast filtreringstekst..."
      />
      <Divider />
      <Grid container spacing={2}>
        {boreholeAccess && (
          <Grid item sm={iotAccess ? 6 : 12} flexGrow={1}>
            <Typography variant="subtitle1">
              <u>Boringer</u>
            </Typography>

            {/* <FormCheckbox
            name="borehole.hasControlProgram"
            label="Kun pejleprogram"
            includeInderterminate
          /> */}

            <FormToggleGroup
              name="borehole.hasControlProgram"
              label="Del af pejleprogram"
              noSelectValue={'indeterminate'}
              values={[
                {label: <Typography>Ja</Typography>, value: true},
                // {label: <RemoveIcon />, value: 'indeterminate'},
                {label: <Typography>Nej</Typography>, value: false},
              ]}
            />

            {/* <FormControlLabel
            control={
              <Controller
                control={formMethods.control}
                name="borehole.hasControlProgram"
                render={({field: {value, ...field}}) => <Checkbox {...field} checked={!!value} />}
              />
            }
            label="Kun pejleprogram"
          /> */}
          </Grid>
        )}
        {iotAccess && (
          <Grid
            item
            sm={boreholeAccess ? 6 : 12}
            display="flex"
            flexDirection="column"
            flexGrow={1}
          >
            <Typography variant="subtitle1">
              <u>Iot filtre</u>
            </Typography>

            <FormToggleGroup
              name="sensor.isCustomerService"
              label="Serviceres af kunden"
              noSelectValue={'indeterminate'}
              values={[
                {label: <Typography>Ja</Typography>, value: true},
                // {label: <RemoveIcon />, value: 'indeterminate'},
                {label: <Typography>Nej</Typography>, value: false},
              ]}
            />
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
                  component="span"
                  sx={{
                    display: 'flex',
                    gap: 1,
                    alignItems: 'center',
                  }}
                >
                  <NotificationIcon iconDetails={{color: 'grey'}} />
                  Vis inaktive lokationer
                </Typography>
              }
            />
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        <Controller
          name="groups"
          control={formMethods.control}
          render={({field: {onChange, value}}) => (
            <LocationGroups
              value={value}
              setValue={onChange}
              label="Filtrer grupper"
              disableLink
              creatable={false}
            />
          )}
        />
      </Grid>

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
