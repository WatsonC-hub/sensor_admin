import {AddCircleOutline} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import React from 'react';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import {onUnitValidate} from '../helper/TimeseriesStepHelper';
import {FieldArrayWithId, UseFieldArrayUpdate} from 'react-hook-form';
import {FormState} from '~/helpers/CreateStationContextProvider';
import Button from '~/components/Button';
import useCreateStationContext from '../api/useCreateStationContext';

type Props = {
  field: FieldArrayWithId<{timeseries: FormState['timeseries']}, 'timeseries', 'id'>;
  index: number;
  update: UseFieldArrayUpdate<{timeseries: FormState['timeseries']}, 'timeseries'>;
};

const AddUnitSection = ({field, index, update}: Props) => {
  const {
    onValidate,
    formState: {units},
  } = useCreateStationContext();
  const [openUnitDialog, setOpenUnitDialog] = React.useState(false);
  return (
    <Box>
      <Button
        bttype="primary"
        startIcon={<AddCircleOutline color="primary" />}
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          px: 0.5,
          border: 'none',
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => setOpenUnitDialog(true)}
      >
        <Typography variant="body1" color="primary">
          Tilføj udstyr
        </Typography>
      </Button>
      {openUnitDialog && (
        <AddUnitForm
          mode="add"
          udstyrDialogOpen={openUnitDialog}
          tstype_id={field.tstype_id ?? undefined}
          setUdstyrDialogOpen={setOpenUnitDialog}
          onValidate={(unit) => {
            onValidate('units', [...(units || []), unit]);
            // onUnitValidate(unit, index, field, onValidate, units, update);
          }}
        />
      )}
    </Box>
  );
};

export default AddUnitSection;
