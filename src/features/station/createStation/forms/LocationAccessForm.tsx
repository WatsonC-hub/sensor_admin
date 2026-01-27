import React, {useEffect} from 'react';
import {AccessTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import useLocationAccessForm from '../../../stamdata/components/stationDetails/locationAccessKeys/api/useLocationAccessForm';
import LocationAccessFormDialog from '../../../stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import {LocationController} from '../controller/types';
import Button from '~/components/Button';
import {Add} from '@mui/icons-material';
import SimpleLocationAccessList from '../helper/SimpleLocationAccessList';
import {Box} from '@mui/material';

type LocationAccessFormProps = {
  controller: LocationController | undefined;
};

const LocationAccessForm = ({controller}: LocationAccessFormProps) => {
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);
  // const location_access = useControllerValues<LocationPayload, 'location_access'>(
  //   controller,
  //   'location_access'
  // );
  const location_access = controller?.getValues().location_access;

  const contactInfoMethods = useLocationAccessForm<AccessTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const {
    formState: {isValid},
    trigger,
  } = contactInfoMethods;

  const onValidChange = (isValid: boolean, value?: AccessTable[]) => {
    controller?.updateSlice('location_access', isValid, value);
  };

  const onEdit = (index: number, data?: AccessTable) => {
    if (data) {
      onValidChange(
        isValid,
        location_access?.map((access: AccessTable, i: number) => (i === index ? data : access))
      );
    }
  };

  const removeLocationAccess = (index: number) => {
    onValidChange(
      true,
      location_access?.filter((_: AccessTable, i: number) => i !== index)
    );
  };

  useEffect(() => {
    controller?.registerSlice('location_access', false, async () => {
      const isValid = await trigger();
      return isValid;
    });
  }, [controller]);

  return (
    <FormProvider {...contactInfoMethods}>
      <Box width={'100%'} display={'flex'} flexDirection={'column'}>
        <SimpleLocationAccessList
          values={(controller?.getValues().location_access || []).map((item) => {
            return {type: item.type, name: item.navn};
          })}
          onEdit={onEdit}
          onRemove={removeLocationAccess}
        />
        <Button
          bttype="primary"
          startIcon={<Add />}
          onClick={() => {
            setLocationAccessDialogOpen(true);
          }}
          sx={{ml: 'auto'}}
        >
          Tilføj ny nøgle eller kode
        </Button>
      </Box>
      {locationAccessDialogOpen && (
        <LocationAccessFormDialog
          openDialog={locationAccessDialogOpen}
          setOpenDialog={setLocationAccessDialogOpen}
          handleSave={(data) => {
            onValidChange(isValid, [...(location_access || []), data]);
            setLocationAccessDialogOpen(false);
          }}
        />
      )}
    </FormProvider>
  );
};

export default LocationAccessForm;
