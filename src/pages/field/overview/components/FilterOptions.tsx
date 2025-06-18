import {CloseOutlined, RestartAlt} from '@mui/icons-material';
import {Box, Typography, FormControlLabel, Checkbox, Divider, Grid} from '@mui/material';
import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';

import Button from '~/components/Button';
import FormInput from '~/components/FormInput';
import FormToggleGroup from '~/components/FormToggleGroup';
import FormToggleSwitch from '~/components/FormToggleSwitch';
import {useUser} from '~/features/auth/useUser';
import {useMapFilterStore} from '~/features/map/store';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import NotificationIcon from '~/pages/field/overview/components/NotificationIcon';
import HighlightItineraries from './HighlightItineraries';

interface FilterOptionsProps {
  onClose: () => void;
}

const FilterOptions = ({onClose}: FilterOptionsProps) => {
  const user = useUser();
  const [filters, setMapFilter, setLocIds] = useMapFilterStore((state) => [
    state.filters,
    state.setFilters,
    state.setLocIds,
  ]);

  const formMethods = useForm<Filter>({values: filters});

  const submit = (data: Filter) => {
    setMapFilter(data);
    setLocIds([]);
  };

  const reset = () => {
    const mapFilter: Filter = {
      ...defaultMapFilter,
      sensor: {
        ...defaultMapFilter.sensor,
        isCustomerService: user.superUser ? false : true,
      },
    };

    formMethods.reset(mapFilter);
    setMapFilter(mapFilter);
  };

  return (
    <FormProvider {...formMethods}>
      <Typography variant="h6">Filtrer lokationer</Typography>
      <FormInput
        name="freeText"
        label="Fritekst filtrering"
        placeholder="Indtast filtreringstekst..."
        onBlurCallback={() => formMethods.handleSubmit(submit)()}
      />
      <Divider />
      <Grid container spacing={2}>
        {user.features.boreholeAccess && (
          <Grid item sm={user.features.iotAccess ? 6 : 12} flexGrow={1}>
            <Typography variant="subtitle1">
              <u>Boringer</u>
            </Typography>

            <FormToggleGroup
              name="borehole.hasControlProgram"
              label="Del af pejleprogram"
              noSelectValue={'indeterminate'}
              onChangeCallback={formMethods.handleSubmit(submit)}
              values={[
                {label: <Typography>Ja</Typography>, value: true},
                // {label: <RemoveIcon />, value: 'indeterminate'},
                {label: <Typography>Nej</Typography>, value: false},
              ]}
            />
          </Grid>
        )}
        {user.features.iotAccess && (
          <Grid
            item
            sm={user?.features.boreholeAccess ? 6 : 12}
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
              onChangeCallback={formMethods.handleSubmit(submit)}
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
                  render={({field: {value, onChange, ...field}}) => (
                    <Checkbox
                      {...field}
                      onChange={(e) => {
                        onChange(e);
                        formMethods.handleSubmit(submit)();
                      }}
                      checked={!!value}
                    />
                  )}
                />
              }
              label={
                <Typography
                  variant="body1"
                  component="span"
                  sx={{display: 'flex', gap: 1, alignItems: 'center'}}
                >
                  <NotificationIcon iconDetails={{color: 'grey'}} />
                  Vis inaktive lokationer
                </Typography>
              }
            />
            {user.superUser && (
              <FormToggleSwitch
                name="sensor.isSingleMeasurement"
                label="Vis kun enkeltmålinger"
                onChangeCallback={formMethods.handleSubmit(submit)}
              />
            )}
            <FormToggleSwitch
              name="sensor.hideLocationsWithoutNotifications"
              label="Skjul lokationer uden notifikationer"
              onChangeCallback={formMethods.handleSubmit(submit)}
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
              setValue={(value) => {
                onChange(value);
                formMethods.handleSubmit(submit)();
              }}
              label="Filtrer grupper"
              disableLink
              creatable={false}
            />
          )}
        />
      </Grid>
      {user.advancedTaskPermission && (
        <Grid item xs={12}>
          <Controller
            name="itineraries"
            control={formMethods.control}
            render={({field: {onChange, value}}) => (
              <HighlightItineraries
                value={value}
                setValue={(value) => {
                  onChange(value);
                  formMethods.handleSubmit(submit)();
                }}
                label="Fremhæv ture"
              />
            )}
          />
        </Grid>
      )}

      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
        <Button bttype="tertiary" onClick={reset} startIcon={<RestartAlt />}>
          Nulstil
        </Button>

        <Button bttype="primary" onClick={onClose} startIcon={<CloseOutlined />}>
          Luk
        </Button>
      </Box>
    </FormProvider>
  );
};

export default FilterOptions;
