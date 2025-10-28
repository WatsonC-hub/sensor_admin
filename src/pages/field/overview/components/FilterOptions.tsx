import {CloseOutlined, RestartAlt} from '@mui/icons-material';
import {Box, Typography, Grid} from '@mui/material';
import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';

import Button from '~/components/Button';
import FormToggleSwitch from '~/components/FormToggleSwitch';
import {useUser} from '~/features/auth/useUser';
import {useMapFilterStore} from '~/features/map/store';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import HighlightItineraries from './HighlightItineraries';
import NotificationTypeFilter from './NotificationTypeFilter';
import TooltipWrapper from '~/components/TooltipWrapper';
import ProjectsFilter from './ProjectsFilter';

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

  const formMethods = useForm<Filter>({defaultValues: filters, values: filters});

  const submit = (data: Filter) => {
    setMapFilter(data);
    setLocIds([]);
  };

  const {handleSubmit, reset, control} = formMethods;

  const resetFilters = () => {
    const mapFilter: Filter = {
      ...defaultMapFilter(user?.superUser),
      sensor: {
        ...defaultMapFilter(user?.superUser).sensor,
        showCustomerService: user?.superUser ? false : true,
        showWatsonCService: user?.superUser ? true : false,
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
      {/* <FormInput
        name="freeText"
        label="Fritekst filtrering"
        placeholder="Indtast filtreringstekst..."
        onBlurCallback={() => handleSubmit(submit)()}
      /> */}
      {/* <Divider /> */}
      <Grid container spacing={0}>
        {user?.features?.boreholeAccess && (
          <Grid
            item
            sm={user?.features?.iotAccess ? 6 : 12}
            display="flex"
            flexDirection="column"
            flexGrow={1}
            gap={1}
          >
            {/* <TooltipWrapper
              description="Boring filtre anvendes til at filtrere lokationer som er en del af et pejleprogram. Tryk på link ikonet for at læse mere om hvad pejleprogrammet er."
              url="https://watsonc.dk/guides/filter-boreholes"
            > */}
            <Typography variant="subtitle1">Borings filtre</Typography>
            {/* </TooltipWrapper> */}

            <TooltipWrapper
              description="Vis boringer som har et pejleprogram tilknyttet. "
              withIcon={false}
            >
              <FormToggleSwitch
                name="borehole.showHasControlProgram"
                label="Har kontrolprogram"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>
            <TooltipWrapper
              description="Vis boringer som ikke har et pejleprogram tilknyttet. "
              withIcon={false}
            >
              <FormToggleSwitch
                name="borehole.showNoControlProgram"
                label="Har ikke kontrolprogram"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>
          </Grid>
        )}
        {user?.features?.iotAccess && (
          <Grid
            item
            sm={user?.features?.boreholeAccess ? 6 : 12}
            display="flex"
            flexDirection="column"
            flexGrow={1}
            gap={1}
          >
            {/* <TooltipWrapper
              description="IoT filtre anvendes til at filtrere lokationer baseret på forskellige parametre som f.eks. om de er serviceret af kunden, om de er inaktive, eller om de har notifikationer. Tryk på link ikonet for at læse mere om filtrering."
              url="https://watsonc.dk/guides/filter-iot"
            > */}
            <Typography variant="subtitle1">IoT filtre</Typography>
            {/* </TooltipWrapper> */}

            {/* </TooltipWrapper> */}
            <TooltipWrapper
              description="Vis lokationer som serviceres af kunden. "
              withIcon={false}
            >
              <FormToggleSwitch
                name="sensor.showCustomerService"
                label="Serviceres af kunden"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>
            <TooltipWrapper
              description="Vis lokationer som serviceres af WatsonC. "
              withIcon={false}
            >
              <FormToggleSwitch
                name="sensor.showWatsonCService"
                label="Serviceres af WatsonC"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>
            <TooltipWrapper
              description="Vis lokaliteter der er inactive, men hvor der tidligere er indsamlet kontinuerte data"
              withIcon={false}
            >
              <FormToggleSwitch
                name="sensor.showInactive"
                label="Inaktive målestationer"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>

            <TooltipWrapper
              withIcon={false}
              description="Viser kun lokaliteter hvor der er notifikationer eller opgaver"
            >
              <FormToggleSwitch
                name="sensor.hideLocationsWithoutNotifications"
                label="Skjul lokationer uden notifikationer"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>
            <TooltipWrapper
              withIcon={false}
              description="Viser kun lokationer som er nyopsætninger, dvs. hvor der ikke er tilknyttet en måleenhed"
            >
              <FormToggleSwitch
                name="sensor.nyOpsætning"
                label="Vis kun nyopsætninger"
                sx={{mr: 0}}
                onChangeCallback={handleSubmit(submit)}
              />
            </TooltipWrapper>
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
              label="Vis notifikationer"
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
              label="Vis grupper"
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
                label="Vis serviceture"
              />
            )}
          />
        </Grid>
      )}
      {user?.superUser && (
        <Grid item xs={12}>
          <Controller
            name="projects"
            control={control}
            render={({field: {onChange, value}}) => (
              <ProjectsFilter
                value={value}
                setValue={(value) => {
                  onChange(value);
                  handleSubmit(submit)();
                }}
                label="Vis projekter"
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
