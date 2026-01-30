import React from 'react';
import {AccessTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import useLocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/api/useLocationAccessForm';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import Button from '~/components/Button';
import {AddCircleOutline} from '@mui/icons-material';
import SimpleLocationAccessList from '../helper/SimpleLocationAccessList';
import {Box, Typography} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';

const LocationAccessForm = () => {
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);
  const {isMobile} = useBreakpoints();
  const [location_access, setLocationAccess] = useCreateStationStore((state) => [
    state.formState.location?.location_access,
    state.setState,
  ]);

  const contactInfoMethods = useLocationAccessForm<AccessTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: AccessTable[]) => {
    setLocationAccess('location.location_access', value);
  };

  const onEdit = (index: number, data?: AccessTable) => {
    if (data) {
      onValidChange(
        location_access?.map((access: AccessTable, i: number) => (i === index ? data : access)) ??
          []
      );
    }
  };

  const removeLocationAccess = (index: number) => {
    onValidChange(location_access?.filter((_: AccessTable, i: number) => i !== index) ?? []);
  };

  return (
    <FormFieldset
      label={'Adgangsnøgler'}
      labelPosition={isMobile ? -22 : -20}
      sx={{width: '100%', p: 1}}
    >
      <FormProvider {...contactInfoMethods}>
        <Box width={'100%'} display={'flex'} flexDirection={'column'}>
          {location_access && location_access.length > 0 && (
            <SimpleLocationAccessList
              values={(location_access || []).map((item) => {
                return {type: item.type, name: item.navn};
              })}
              onEdit={onEdit}
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
              px: 0.5,
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
            setOpenDialog={setLocationAccessDialogOpen}
            handleSave={(data) => {
              onValidChange([...(location_access || []), data]);
              setLocationAccessDialogOpen(false);
            }}
          />
        )}
      </FormProvider>
    </FormFieldset>
  );
};

export default LocationAccessForm;
