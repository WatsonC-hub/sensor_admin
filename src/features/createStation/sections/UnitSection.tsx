import React, {useState} from 'react';
import {Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import Button from '~/components/Button';
import UnitForm from '../forms/UnitForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {useUnit} from '~/features/stamdata/api/useUnit';
import dayjs from 'dayjs';
import RouterIcon from '@mui/icons-material/Router';
import SimpleTextView from '~/components/SimpleTextView';
import {button_sx} from '../common_style';

type UnitStepProps = {
  uuid: string;
  tstype_id: number;
};

const UnitSection = ({uuid, tstype_id}: UnitStepProps) => {
  const [open, setOpen] = useState(false);
  const [unit, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[uuid].unit,
    state.setState,
    state.deleteState,
  ]);

  const {
    get: {data: availableUnits},
  } = useUnit();

  const uniqueUnit = availableUnits?.find((data) => data.unit_uuid == unit?.unit_uuid);

  const sensor_id = `${uniqueUnit?.signal_id} - ${uniqueUnit?.sensor_id} (${uniqueUnit?.sensortypename})`;

  const handleCloseDialog = () => {
    deleteState(`timeseries.${uuid}.unit`);
    setOpen(false);
  };

  return (
    <FormFieldset label={'Udstyr'} sx={{width: '100%', p: 1}}>
      {unit === undefined && (
        <Button
          bttype="primary"
          startIcon={<AddCircleOutline color="primary" />}
          sx={{
            backgroundColor: 'transparent',
            width: 'fit-content',
            border: 'none',
            px: 1,
            ':hover': {backgroundColor: 'grey.200'},
          }}
          onClick={() => setOpen(true)}
        >
          <Typography variant="body1" color="primary">
            Tilføj udstyr
          </Typography>
        </Button>
      )}
      {Object.keys(unit || {}).length > 0 && (
        <SimpleTextView
          icon={<RouterIcon color="primary" sx={{mr: 1.5}} />}
          primaryText={<Typography variant="body2">{unit?.calypso_id}</Typography>}
          secondaryText={
            <>
              <Typography variant="caption" display={'block'}>
                {sensor_id}
              </Typography>
              <Typography variant="caption">
                {unit?.startdate && dayjs(unit.startdate).format('L HH:mm')}
              </Typography>
            </>
          }
        />
      )}
      {unit !== undefined && (
        <Button
          bttype="primary"
          startIcon={<RemoveCircleOutline />}
          sx={button_sx(unit === undefined)}
          onClick={() => {
            deleteState(`timeseries.${uuid}.unit`);
          }}
        >
          Fjern udstyr
        </Button>
      )}
      <Dialog open={open} onClose={handleCloseDialog}>
        <DialogTitle>Tilføj udstyr</DialogTitle>
        <DialogContent>
          <UnitForm
            unit={unit}
            onClose={handleCloseDialog}
            setValues={(values) => {
              setState(`timeseries.${uuid}.unit`, values);
              setOpen(false);
            }}
            tstype_id={tstype_id}
          />
        </DialogContent>
      </Dialog>
    </FormFieldset>
  );
};

export default UnitSection;
