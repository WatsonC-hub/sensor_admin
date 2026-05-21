import React, {useEffect} from 'react';
import {AccessTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import useLocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/api/useLocationAccessForm';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import Button from '~/components/Button';
import {AddCircleOutline, DoNotDisturb, Edit} from '@mui/icons-material';
import SimpleLocationAccessList from '../helper/SimpleLocationAccessList';
import {Box} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';
import {button_sx} from '../common_style';

const LocationAccessForm = () => {
  const {isMobile} = useBreakpoints();
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);
  const [location_access, location, setState, deleteState, registerSubmitter, removeSubmitter] =
    useCreateStationStore((state) => [
      state.formState.location?.location_access,
      state.formState.location,
      state.setState,
      state.deleteState,
      state.registerSubmitter,
      state.removeSubmitter,
    ]);

  const locationAccessMethods = useLocationAccessForm<AccessTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: AccessTable[] | undefined) => {
    setState('location.location_access', value);
  };

  const removeLocationAccess = (index: number) => {
    const filteredLocationAccess =
      location_access?.filter((_: AccessTable, i: number) => i !== index) ?? [];
    if (filteredLocationAccess.length === 0) onValidChange([]);
    else onValidChange(filteredLocationAccess);
  };

  useEffect(() => {
    registerSubmitter('location.location_access', () => {
      if (location_access === undefined || Array.isArray(location_access)) {
        return Promise.resolve(true);
      }
      return Promise.resolve(false);
    });

    return () => removeSubmitter('location.location_access');
  }, [location_access, location]);

  return (
    <FormFieldset label={'Adgangsnøgler'} sx={{p: 1, width: '100%'}}>
      <FormProvider {...locationAccessMethods}>
        <Box display={'flex'} flexDirection={'column'}>
          <SimpleLocationAccessList
            values={
              location_access
                ? location_access.map((item) => ({type: item.type, name: item.navn}))
                : undefined
            }
            onRemove={removeLocationAccess}
          />
          <Box
            display="flex"
            flexDirection={isMobile ? 'column' : 'row'}
            justifyContent={'flex-start'}
            gap={1}
          >
            <Button
              bttype="primary"
              startIcon={<AddCircleOutline />}
              sx={{
                ...button_sx(location_access !== undefined && location_access.length > 0),
                alignSelf: isMobile ? 'start' : 'center',
              }}
              onClick={() => {
                setLocationAccessDialogOpen(true);
              }}
            >
              Tilføj
            </Button>
            <Button
              bttype="tertiary"
              disabled={location_access && location_access.length > 0}
              startIcon={<DoNotDisturb />}
              sx={{
                ...button_sx(location_access !== undefined && location_access.length === 0),
                alignSelf: isMobile ? 'start' : 'center',
              }}
              onClick={() => {
                setState('location.location_access', []);
              }}
            >
              Ingen adgangsnøgler
            </Button>
            <Button
              bttype="primary"
              disabled={location_access && location_access.length > 0}
              startIcon={<Edit />}
              sx={{
                ...button_sx(location_access === undefined),
                alignSelf: isMobile ? 'start' : 'center',
              }}
              onClick={() => {
                deleteState('location.location_access');
              }}
            >
              Registrer senere
            </Button>
          </Box>
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
  );
};

export default LocationAccessForm;
