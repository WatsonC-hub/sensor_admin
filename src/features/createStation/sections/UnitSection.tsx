import React, {useState} from 'react';
import {Box, Dialog, DialogContent, DialogTitle, IconButton, Typography} from '@mui/material';
import useBreakpoints from '~/hooks/useBreakpoints';
import {AddCircleOutline, RemoveCircleOutline} from '@mui/icons-material';
import FormFieldset from '~/components/formComponents/FormFieldset';
import Button from '~/components/Button';
import UnitForm from '../forms/UnitForm';
import {useCreateStationStore} from '../state/useCreateStationStore';
import {useUnit} from '~/features/stamdata/api/useAddUnit';
import dayjs from 'dayjs';
import RouterIcon from '@mui/icons-material/Router';
import SimpleTextView from '~/components/SimpleTextView';

type UnitStepProps = {
  uuid: string;
  tstype_id: number;
};

const UnitSection = ({uuid, tstype_id}: UnitStepProps) => {
  const {isMobile} = useBreakpoints();
  const [open, setOpen] = useState(false);
  const [unit, setState, deleteState] = useCreateStationStore((state) => [
    state.formState.timeseries?.[uuid].unit,
    state.setState,
    state.deleteState,
  ]);

  const {
    get: {data: availableUnits},
  } = useUnit();

  const uniqueUnit = availableUnits?.find(
    (data) =>
      data.sensortypeid === tstype_id &&
      (data.calypso_id.toString() === unit?.calypso_id || data.terminal_id === unit?.calypso_id)
  );

  const sensor_id = `${uniqueUnit?.signal_id} - ${uniqueUnit?.sensor_id} (${uniqueUnit?.sensortypename})`;

  const show = unit !== undefined;

  if (show)
    return (
      <Box display="flex" flexDirection="row" alignItems={'start'}>
        {!isMobile && (
          <IconButton
            color="primary"
            size="small"
            onClick={() => {
              deleteState(`timeseries.${uuid}.unit`);
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
                startIcon={<RemoveCircleOutline color="primary" fontSize="small" />}
                onClick={() => {
                  deleteState(`timeseries.${uuid}.unit`);
                }}
              >
                <Typography variant="body2" color="grey.700">
                  Udstyr
                </Typography>
              </Button>
            ) : (
              'Udstyr'
            )
          }
          labelPosition={isMobile ? -22 : -20}
          sx={{width: '100%', p: 1}}
        >
          {Object.keys(unit).length > 0 && (
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
          <Dialog
            open={open}
            onClose={() => {
              setOpen(false);
            }}
          >
            <DialogTitle>Tilføj udstyr</DialogTitle>
            <DialogContent>
              <UnitForm
                unit={unit}
                onClose={() => {
                  setOpen(false);
                }}
                setValues={(values) => {
                  setState(`timeseries.${uuid}.unit`, values);
                  setOpen(false);
                }}
                tstype_id={tstype_id}
              />
            </DialogContent>
          </Dialog>
        </FormFieldset>
      </Box>
    );

  return (
    <Box>
      <Button
        bttype="primary"
        startIcon={<AddCircleOutline color="primary" />}
        sx={{
          width: 'fit-content',
          backgroundColor: 'transparent',
          px: 1,
          border: 'none',
          ':hover': {
            backgroundColor: 'grey.200',
          },
        }}
        onClick={() => {
          setState(`timeseries.${uuid}.unit`, {});
          setOpen(true);
        }}
      >
        <Typography variant="body1" color="primary">
          Tilføj udstyr
        </Typography>
      </Button>
    </Box>
  );
};

export default UnitSection;
