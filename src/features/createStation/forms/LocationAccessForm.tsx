import React, {useEffect} from 'react';
import {Access, AccessTable} from '~/types';
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
import {createTypedForm} from '~/components/formComponents/Form';

const Form = createTypedForm<Access>();

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

  const locationAccessMethods = useLocationAccessForm<Access>({
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
      <Form formMethods={locationAccessMethods}>
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
            Form={Form}
            openDialog={locationAccessDialogOpen}
            setOpenDialog={(close) => {
              setLocationAccessDialogOpen(close);
            }}
            handleSave={(data) => {
              const newAccess: AccessTable = {
                contact_id: data.contact_id ?? '',
                id: data.id ?? -1,
                kommentar: data.kommentar ?? '',
                koden: data.koden ?? '',
                navn: data.navn ?? '',
                placering: data.placering ?? '',
                type: data.type as string,
                contact_name: data.contact_name ?? '',
              };
              onValidChange([...(location_access || []), newAccess]);
              setLocationAccessDialogOpen(false);
            }}
          />
        )}
      </Form>
    </FormFieldset>
  );
};

export default LocationAccessForm;
