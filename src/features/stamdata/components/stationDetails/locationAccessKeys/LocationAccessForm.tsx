import React from 'react';
import {AccessTable} from '~/types';
import {Add} from '@mui/icons-material';
import Button from '~/components/Button';
import useCreateStationContext from '~/features/station/createStation/api/useCreateStationContext';
import {FormProvider} from 'react-hook-form';
import useLocationAccessForm from './api/useLocationAccessForm';
import LocationAccessTable from './LocationAccessTable';
import LocationAccessFormDialog from './LocationAccessFormDialog';

type LocationAccessFormProps = {
  loc_id?: number;
  mode: 'add' | 'edit' | 'mass_edit';
  defaultLocationAccess: Array<AccessTable> | undefined;
};

const LocationAccessForm = ({loc_id, mode, defaultLocationAccess}: LocationAccessFormProps) => {
  const {formState, onValidate} = useCreateStationContext();
  const [currentIndex, setCurrentIndex] = React.useState<number>(-1);
  const [locationAccessDialogOpen, setLocationAccessDialogOpen] = React.useState<boolean>(false);

  const contactInfoMethods = useLocationAccessForm<AccessTable>({
    defaultValues: undefined,
    mode: mode,
  });

  const onEdit = (index: number, data?: AccessTable) => {
    setCurrentIndex(index);
    if (data) {
      onValidate(
        'location_access',
        formState.location_access?.map((access: AccessTable, i: number) =>
          i === index ? data : access
        )
      );
    }
  };

  const removeLocationAccess = (index: number) => {
    onValidate(
      'location_access',
      formState.location_access?.filter((_: AccessTable, i: number) => i !== index)
    );
  };

  return (
    <FormProvider {...contactInfoMethods}>
      <LocationAccessTable
        mode={mode}
        loc_id={loc_id}
        location_access={defaultLocationAccess}
        removeLocationAccess={removeLocationAccess}
        alterLocationAccess={onEdit}
        currentIndex={currentIndex}
        setCurrentIndex={setCurrentIndex}
      />
      {locationAccessDialogOpen && (
        <LocationAccessFormDialog
          loc_id={loc_id}
          openDialog={locationAccessDialogOpen}
          setOpenDialog={setLocationAccessDialogOpen}
          handleSave={(data) => {
            onValidate('location_access', [...(defaultLocationAccess || []), data]);
            setLocationAccessDialogOpen(false);
          }}
        />
      )}
      {mode === 'add' && (
        <Button
          bttype="primary"
          startIcon={<Add />}
          disabled={loc_id !== undefined}
          onClick={() => {
            setLocationAccessDialogOpen(true);
            setCurrentIndex(-1);
          }}
          sx={{ml: 'auto'}}
        >
          Tilføj ny nøgle eller kode
        </Button>
      )}
    </FormProvider>
  );
};

export default LocationAccessForm;
