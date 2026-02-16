import React from 'react';
import {AccessTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import useLocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/api/useLocationAccessForm';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import Button from '~/components/Button';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import SimpleLocationAccessList from '../helper/SimpleLocationAccessList';
import {Box, IconButton, Typography} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';

const LocationAccessForm = () => {
  const {isMobile} = useBreakpoints();
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);
  const [location_access, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.location?.location_access,
    state.setState,
    state.deleteState,
  ]);

  const locationAccessMethods = useLocationAccessForm<AccessTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: AccessTable[]) => {
    setState('location.location_access', value);
  };

  const removeLocationAccess = (index: number) => {
    const filteredLocationAccess =
      location_access?.filter((_: AccessTable, i: number) => i !== index) ?? [];
    onValidChange(filteredLocationAccess);
  };

  const show = location_access !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState('location.location_access');
            }}
          >
            <RemoveCircleOutline fontSize="small" />
          </IconButton>
        )}
        <FormFieldset
          label={
            isMobile ? (
              <Button
                bttype="borderless"
                sx={{p: 0, m: 0}}
                startIcon={<RemoveCircleOutline color="primary" />}
                onClick={() => {
                  deleteState('location.location_access');
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Adgangsnøgler
                </Typography>
              </Button>
            ) : (
              'Adgangsnøgler'
            )
          }
          labelPosition={-20}
          sx={{width: '100%', p: 1}}
        >
          <FormProvider {...locationAccessMethods}>
            <Box width={'100%'} display={'flex'} flexDirection={'column'}>
              {location_access && (
                <SimpleLocationAccessList
                  values={(location_access || []).map((item) => {
                    return {type: item.type, name: item.navn};
                  })}
                  onRemove={removeLocationAccess}
                />
              )}
              <Button
                bttype="primary"
                startIcon={<AddCircleOutline color="primary" />}
                sx={{
                  width: 'fit-content',
                  backgroundColor: 'transparent',
                  border: 'none',
                  px: '6.5px',
                  ':hover': {
                    backgroundColor: 'grey.200',
                  },
                }}
                onClick={() => {
                  setLocationAccessDialogOpen(true);
                }}
              >
                <Typography variant="body1" color="primary">
                  Tilføj adgangsnøgle
                </Typography>
              </Button>
            </Box>
            {locationAccessDialogOpen && (
              <LocationAccessFormDialog
                openDialog={locationAccessDialogOpen}
                setOpenDialog={(close) => {
                  setLocationAccessDialogOpen(close);
                }}
                handleSave={(data) => {
                  onValidChange([...(location_access || []), data]);
                  setLocationAccessDialogOpen(false);
                }}
              />
            )}
          </FormProvider>
        </FormFieldset>
      </Box>
    );

  return (
    <Box alignItems={'center'}>
      <Button
        bttype="primary"
        startIcon={<AddCircleOutline color="primary" />}
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          border: 'none',
          px: 1,
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setState('location.location_access', []);
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj adgangsnøgler
        </Typography>
      </Button>
    </Box>
  );
};

export default LocationAccessForm;
