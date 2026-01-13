import {AddCircleOutline} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import React from 'react';
import AddUnitForm from '~/features/stamdata/components/stamdata/AddUnitForm';
import {onUnitValidate} from '../helper/TimeseriesStepHelper';
import {FieldArrayWithId, UseFieldArrayUpdate} from 'react-hook-form';
import {FormState} from '~/helpers/CreateStationContextProvider';
import Button from '~/components/Button';
import useCreateStationContext from '../api/useCreateStationContext';
import useBreakpoints from '~/hooks/useBreakpoints';

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
  const {isMobile} = useBreakpoints();
  const [openUnitDialog, setOpenUnitDialog] = React.useState(false);
  return (
    <Box display={isMobile ? 'flex' : undefined} justifyContent={isMobile ? 'end' : undefined}>
      <Button
        bttype="primary"
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          border: 'none',
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => setOpenUnitDialog(true)}
      >
        <Box display="flex" flexDirection="row" alignItems="center" gap={1}>
          <Typography variant="body1" color="primary">
            Tilføj udstyr
          </Typography>
          <AddCircleOutline color="primary" />
        </Box>
      </Button>
      {openUnitDialog && (
        <AddUnitForm
          mode="add"
          udstyrDialogOpen={openUnitDialog}
          tstype_id={field.tstype_id ?? undefined}
          setUdstyrDialogOpen={setOpenUnitDialog}
          onValidate={(unit) => {
            onUnitValidate(unit, index, field, onValidate, units, update);
          }}
        />
      )}
    </Box>
  );
};

export default AddUnitSection;
