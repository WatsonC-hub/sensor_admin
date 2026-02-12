import {CloseOutlined, RestartAlt} from '@mui/icons-material';
import {Box, Typography, Grid2} from '@mui/material';
import React from 'react';
import {useForm, FormProvider, Controller} from 'react-hook-form';

import Button from '~/components/Button';
import {useUser} from '~/features/auth/useUser';
import LocationGroups from '~/features/stamdata/components/stamdata/LocationGroups';
import {Filter, defaultMapFilter} from '~/pages/field/overview/components/filter_consts';
import NotificationTypeFilter from './NotificationTypeFilter';
import TooltipWrapper from '~/components/TooltipWrapper';
import ProjectsFilter from './ProjectsFilter';
import LocationFilter from './LocationFilter';
import FormToggleButton from '~/components/formComponents/FormToggleButton';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useMapFilterStore} from '~/features/map/hooks/useMapFilterStore';

interface FilterOptionsProps {
  isParentClosed: boolean;
  onClose: () => void;
}

const FilterOptions = ({isParentClosed, onClose}: FilterOptionsProps) => {
  const {isMobile} = useBreakpoints();
  const {
    superUser,
    features: {boreholeAccess, iotAccess},
  } = useUser();
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
      ...defaultMapFilter(superUser),
      showService: superUser ? 'watsonc' : 'kunde',
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
      <Grid2 container spacing={0}>
        {iotAccess && (
          <Grid2
            size={boreholeAccess ? 6 : 12}
            display="flex"
            flexDirection="column"
            flexGrow={1}
            gap={1}
          >
            <FormToggleButton
              gridSizes={12}
              name="showService"
              label="Serviceres af"
              size="small"
              gridDirection="row"
              onChangeCallback={() => {
                handleSubmit(submit)();
              }}
              direction="row"
            />
          </Grid2>
        )}
      </Grid2>
      <Grid2 container spacing={0.5} mt={1}>
        <Grid2 size={12} display="flex">
          <Controller
            name="locationFilter"
            control={control}
            render={({field: {onChange, value}}) => {
              const unique = Array.from(new Set(value));
              return (
                <LocationFilter
                  isParentClosed={isParentClosed}
                  value={unique}
                  setValue={(value) => {
                    onChange(value);
                    handleSubmit(submit)();
                  }}
                  label="Vis lokationer der er/har"
                  disabled={
                    filters.groups.length > 0 ||
                    filters.projects.length > 0 ||
                    filters.notificationTypes.length > 0
                  }
                />
              );
            }}
          />
        </Grid2>
        <Grid2 size={isMobile ? 12 : 6}>
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
                label="Vis fra grupper"
                disableLink
                creatable={false}
              />
            )}
          />
        </Grid2>
        {superUser && (
          <Grid2 size={isMobile ? 12 : 6}>
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
                  label="Vis fra projekter"
                />
              )}
            />
          </Grid2>
        )}
        <Grid2 size={12}>
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
                label="Filtrer på notifikationer"
              />
            )}
          />
          {/* </TooltipWrapper> */}
        </Grid2>
      </Grid2>

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
