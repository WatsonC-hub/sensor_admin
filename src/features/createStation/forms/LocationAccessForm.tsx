import React, {useEffect, useState} from 'react';
import {AccessTable} from '~/types';
import {FormProvider} from 'react-hook-form';
import useLocationAccessForm from '~/features/stamdata/components/stationDetails/locationAccessKeys/api/useLocationAccessForm';
import LocationAccessFormDialog from '~/features/stamdata/components/stationDetails/locationAccessKeys/LocationAccessFormDialog';
import Button from '~/components/Button';
import {AddCircleOutline, Check, RemoveCircleOutline} from '@mui/icons-material';
import SimpleLocationAccessList from '../helper/SimpleLocationAccessList';
import {Box, IconButton, Typography} from '@mui/material';
import {useCreateStationStore} from '../state/useCreateStationStore';
import FormFieldset from '~/components/formComponents/FormFieldset';
import useBreakpoints from '~/hooks/useBreakpoints';

const LocationAccessForm = () => {
  const {isMobile} = useBreakpoints();
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);
  const [error, setError] = useState<string | undefined>(undefined);
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

  const notRelevant = Array.isArray(location_access) && location_access.length === 0;
  const onValidChange = (value: AccessTable[] | undefined) => {
    setState('location.location_access', value);
  };

  const removeLocationAccess = (index: number) => {
    const filteredLocationAccess =
      location_access?.filter((_: AccessTable, i: number) => i !== index) ?? [];
    if (filteredLocationAccess.length === 0) onValidChange(undefined);
    else onValidChange(filteredLocationAccess);
  };

  useEffect(() => {
    registerSubmitter('location.location_access', () => {
      if (
        Array.isArray(location_access) ||
        !Object.keys(location || {}).includes('location_access')
      ) {
        return Promise.resolve(true);
      }
      setError('Tilføj en nøgle eller tryk på "Ikke relevant"');
      return Promise.resolve(false);
    });

    return () => removeSubmitter('location.location_access');
  }, [location_access, location]);

  const show = Object.keys(location || {}).includes('location_access');

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
              <SimpleLocationAccessList
                values={(location_access || []).map((item) => {
                  return {type: item.type, name: item.navn};
                })}
                onRemove={removeLocationAccess}
                warning={
                  error &&
                  location_access === undefined && (
                    <Typography variant="caption" color="error">
                      {error}
                    </Typography>
                  )
                }
              />
              <Box display="flex" flexDirection="row" justifyContent={'flex-start'} gap={1}>
                {!notRelevant && (
                  <Button
                    bttype="primary"
                    startIcon={<AddCircleOutline />}
                    sx={{
                      width: 'fit-content',
                      backgroundColor: 'transparent',
                      border: 'none',
                      px: '6.5px',
                      color: 'primary.main',
                      ':hover': {
                        backgroundColor: 'grey.200',
                      },
                    }}
                    onClick={() => {
                      setLocationAccessDialogOpen(true);
                    }}
                  >
                    <Typography variant="body1">Tilføj adgangsnøgle</Typography>
                  </Button>
                )}
                {location_access === undefined && (
                  <Button
                    bttype="tertiary"
                    startIcon={<Check />}
                    sx={{
                      width: 'fit-content',
                      backgroundColor: 'transparent',
                      border: 'none',
                      color: 'primary.main',
                      px: '6.5px',
                      ':hover': {
                        backgroundColor: 'grey.200',
                      },
                    }}
                    onClick={() => {
                      setState('location.location_access', []);
                    }}
                  >
                    <Typography variant="body1">Ikke relevant</Typography>
                  </Button>
                )}
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
          setState('location.location_access', undefined);
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
