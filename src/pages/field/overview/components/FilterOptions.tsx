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
import NotificationTypeFilter from './NotificationTypeFilter';
import TooltipWrapper from '~/components/TooltipWrapper';

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

  const {handleSubmit, reset, control} = formMethods;

  const resetFilters = () => {
    const mapFilter: Filter = {
      ...defaultMapFilter,
      sensor: {
        ...defaultMapFilter.sensor,
        isCustomerService: user?.superUser ? false : true,
      },
    };

    reset(mapFilter);
    setMapFilter(mapFilter);
  };

  return (
    <FormProvider {...formMethods}>
      <TooltipWrapper
        url="https://watsonc.dk/guides/kort-filtrering"
        description="Se guide til filtrering af lokationer"
      >
        <Typography variant="h6">Filtrer lokationer</Typography>
      </TooltipWrapper>
      <FormInput
        name="freeText"
        label="Fritekst filtrering"
        placeholder="Indtast filtreringstekst..."
        onBlurCallback={() => handleSubmit(submit)()}
      />
      <Divider />
      <Grid container spacing={2}>
        {user?.features?.boreholeAccess && (
          <Grid item sm={user?.features?.iotAccess ? 6 : 12} flexGrow={1}>
            {/* <TooltipWrapper
              description="Boring filtre anvendes til at filtrere lokationer som er en del af et pejleprogram. Tryk på link ikonet for at læse mere om hvad pejleprogrammet er."
              url="https://watsonc.dk/guides/filter-boreholes"
            > */}
            <Typography variant="subtitle1">
              <u>Boring filtre</u>
            </Typography>
            {/* </TooltipWrapper> */}

            <FormToggleGroup
              name="borehole.hasControlProgram"
              label="Del af pejleprogram"
              noSelectValue={'indeterminate'}
              onChangeCallback={handleSubmit(submit)}
              values={[
                {label: <Typography>Ja</Typography>, value: true},
                // {label: <RemoveIcon />, value: 'indeterminate'},
                {label: <Typography>Nej</Typography>, value: false},
              ]}
            />
          </Grid>
        )}
        {user?.features?.iotAccess && (
          <Grid
            item
            sm={user?.features?.boreholeAccess ? 6 : 12}
            display="flex"
            flexDirection="column"
            flexGrow={1}
          >
            {/* <TooltipWrapper
              description="IoT filtre anvendes til at filtrere lokationer baseret på forskellige parametre som f.eks. om de er serviceret af kunden, om de er inaktive, eller om de har notifikationer. Tryk på link ikonet for at læse mere om filtrering."
              url="https://watsonc.dk/guides/filter-iot"
            > */}
            <Typography variant="subtitle1">
              <u>Iot filtre</u>
            </Typography>
            {/* </TooltipWrapper> */}

            <Typography variant="subtitle1">Serviceret af kunden</Typography>
            {/* <TooltipWrapper description="Serviceret af kunden kan filtrere efter tre muligheder: Ja, Nej, eller ingen (hvis du ikke ønsker at filtrere på dette felt. Det indikeres ved at der hverken er valgt ja eller nej)."> */}
            <Box>
              <FormToggleGroup
                name="sensor.isCustomerService"
                label=""
                noSelectValue={'indeterminate'}
                onChangeCallback={handleSubmit(submit)}
                values={[
                  {label: <Typography>Ja</Typography>, value: true},
                  // {label: <RemoveIcon />, value: 'indeterminate'},
                  {label: <Typography>Nej</Typography>, value: false},
                ]}
              />
            </Box>
            {/* </TooltipWrapper> */}
            <FormControlLabel
              control={
                <Controller
                  control={control}
                  name="sensor.showInactive"
                  render={({field: {value, onChange, ...field}}) => (
                    <Checkbox
                      {...field}
                      onChange={(e) => {
                        onChange(e);
                        handleSubmit(submit)();
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
            {user?.superUser && (
              <FormToggleSwitch
                name="sensor.isSingleMeasurement"
                label="Vis kun enkeltmålinger"
                onChangeCallback={handleSubmit(submit)}
              />
            )}
            {/* <TooltipWrapper description="Skjul lokationer uden notifikationer kan filtrere lokationer baseret på om de har notifikationer eller ej. Hvis du vælger at skjule lokationer uden notifikationer, vil kun lokationer med aktive notifikationer blive vist."> */}
            <FormToggleSwitch
              name="sensor.hideLocationsWithoutNotifications"
              label="Skjul lokationer uden notifikationer"
              sx={{mr: 0}}
              onChangeCallback={handleSubmit(submit)}
            />
            {/* </TooltipWrapper> */}
          </Grid>
        )}
      </Grid>
      <Grid item xs={12}>
        {/* <TooltipWrapper description="Lokationer kan filtreres baseret på forskellige notifikationstyper, såsom data sender ikke, lav iltindhold, eller andre specifikke notifikationstyper. Dette giver dig mulighed for at fokusere på de notifikationer, der er mest relevante for dig."> */}
        <Controller
          name="notificationTypes"
          control={control}
          render={({field: {onChange, value}}) => (
            <NotificationTypeFilter
              value={value}
              setValue={(value) => {
                onChange(value);
                handleSubmit(submit)();
              }}
              label="Notifikationer"
            />
          )}
        />
        {/* </TooltipWrapper> */}
      </Grid>
      <Grid item xs={12}>
        {/* <TooltipWrapper
          description="Grupper kan filtrere lokationer som har samme gruppe tilknyttet. Dette kan være nyttigt for at organisere og sortere lokationer baseret på deres tilhørsforhold til specifikke grupper. Du kan vælge en eller flere grupper for at filtrere lokationer, der er en del af disse grupper."
          // url="https://watsonc.dk/guides/filter-groups"
        > */}
        <Controller
          name="groups"
          control={control}
          render={({field: {onChange, value}}) => (
            <LocationGroups
              value={value}
              setValue={(value) => {
                onChange(value);
                handleSubmit(submit)();
              }}
              label="Filtrer grupper"
              disableLink
              creatable={false}
            />
          )}
        />
        {/* </TooltipWrapper> */}
      </Grid>
      {user?.advancedTaskPermission && (
        <Grid item xs={12}>
          <Controller
            name="itineraries"
            control={control}
            render={({field: {onChange, value}}) => (
              <HighlightItineraries
                value={value}
                setValue={(value) => {
                  onChange(value);
                  handleSubmit(submit)();
                }}
                label="Fremhæv ture"
              />
            )}
          />
        </Grid>
      )}

      <Box sx={{display: 'flex', justifyContent: 'flex-end', gap: 1}}>
        <Button bttype="tertiary" onClick={resetFilters} startIcon={<RestartAlt />}>
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
