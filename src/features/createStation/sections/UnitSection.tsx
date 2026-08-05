import {AddCircleOutlined, RemoveCircleOutlined} from '@mui/icons-material';
import RouterIcon from '@mui/icons-material/Router';
import {Dialog, DialogContent, DialogTitle, Typography} from '@mui/material';
import dayjs from 'dayjs';
import React, {useState} from 'react';

import Button from '~/components/Button';
import FormFieldset from '~/components/formComponents/FormFieldset';
import SimpleTextView from '~/components/SimpleTextView';
import {useUnit} from '~/features/stamdata/api/useUnit';

import {button_sx} from '../commonStyle';
import UnitForm from '../forms/UnitForm';
import {useCreateStationStore} from '../state/useCreateStationStore';

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
          startIcon={<AddCircleOutlined />}
          sx={button_sx(unit !== undefined)}
          onClick={() => setOpen(true)}
        >
          Tilføj udstyr
        </Button>
      )}
      {Object.keys(unit || {}).length > 0 && (
        <SimpleTextView
          icon={<RouterIcon color="primary" sx={{mr: 1.5}} />}
          primaryText={<Typography variant="body2">{unit?.calypso_id}</Typography>}
          secondaryText={
            <>
              <Typography
                variant="caption"
                sx={{
                  display: 'block',
                }}
              >
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
          startIcon={<RemoveCircleOutlined />}
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
