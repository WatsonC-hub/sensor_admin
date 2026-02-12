import React, {useState} from 'react';
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
  const [show, setShow] = useState<boolean>(false);
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);
  const [location_access, setLocationAccess, deleteState] = useCreateStationStore((state) => [
    state.formState.location?.location_access,
    state.setState,
    state.deleteState,
  ]);

  const locationAccessMethods = useLocationAccessForm<AccessTable>({
    defaultValues: undefined,
    mode: 'add',
  });

  const onValidChange = (value: AccessTable[]) => {
    setLocationAccess('location.location_access', value);
  };

  const removeLocationAccess = (index: number) => {
    onValidChange(location_access?.filter((_: AccessTable, i: number) => i !== index) ?? []);
  };

  if (!show)
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
            setShow(true);
            setLocationAccessDialogOpen(true);
          }}
        >
          <Typography variant="body1" color="primary">
            Tilføj adgangsnøgler
          </Typography>
        </Button>
      </Box>
    );

  return (
    <Box display="flex" flexDirection="row" gap={1} alignItems={'center'}>
      {!isMobile && (
        <IconButton
          color="primary"
          size="small"
          onClick={() => {
            setShow(false);
            deleteState('location.location_access');
          }}
        >
          <RemoveCircleOutline fontSize="small" />
        </IconButton>
      )}
      <FormFieldset
        label={
          isMobile && show ? (
            <Button
              bttype="borderless"
              sx={{p: 0, m: 0}}
              startIcon={<RemoveCircleOutline color="primary" />}
              onClick={() => {
                setShow(false);
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
            {location_access && location_access.length > 0 && (
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
};

export default LocationAccessForm;
