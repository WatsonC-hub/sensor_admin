import {Save} from '@mui/icons-material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {CircularProgress, MenuItem, Typography, Box, IconButton} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Autocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import CaptureDialog from '~/components/CaptureDialog';
import OwnDatePicker from '~/components/OwnDatePicker';
import {UnitPost, useUnit} from '~/features/stamdata/api/useAddUnit';
import {authStore, stamdataStore} from '~/state/store';

interface AddUnitFormProps {
  udstyrDialogOpen: boolean;
  setUdstyrDialogOpen: (open: boolean) => void;
  tstype_id: number;
  mode: string;
}

export default function AddUnitForm({
  udstyrDialogOpen,
  setUdstyrDialogOpen,
  tstype_id,
  mode,
}: AddUnitFormProps) {
  const [timeseries, setUnit] = stamdataStore((store) => [store.timeseries, store.setUnit]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    terminal_id: number;
    amount: number;
    subscription_type: string;
  } | null>(null);
  const queryClient = useQueryClient();
  const [openCaptureDialog, setOpenCaptureDialog] = useState(false);

  const superUser = authStore((state) => state.superUser);

  const {
    get: {data: availableUnits, isLoading},
    post: addUnit,
  } = useUnit();

  const {trigger, setValue} = useFormContext();

  const [unitData, setUnitData] = useState({
    calypso_id: '',
    sensor_id: '',
    uuid: '',
    fra: new Date(),
  });

  const uniqueCalypsoIds = [
    ...new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((x) => (x.calypso_id == '0' ? x.terminal_id : x.calypso_id))
    ),
  ].sort((a, b) => {
    if (typeof a == 'number' && typeof b == 'number') {
      return a - b;
    } else if (typeof a == 'string' && typeof b == 'string') {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
    } else if (typeof a == 'string') {
      return 1;
    } else {
      return -1;
    }
    return 0;
  });

  const sensorsForCalyspoId = (id: string) =>
    availableUnits?.filter(
      (unit) =>
        (unit.calypso_id === id || unit.terminal_id === id) && unit.sensortypeid === tstype_id
    );

  const handleCalypsoIdNew = (
    option: {value: string; label: string} | SyntheticEvent<Element> | null
  ) => {
    if (option == null) {
      setUnitData((currentUnit) => ({...currentUnit, calypso_id: '', uuid: ''}));
      return;
    }
    setUnitData((currentUnit) => ({
      ...currentUnit,
      calypso_id: (option as {value: string; label: string}).value,
      uuid: '',
    }));

    const sensors = sensorsForCalyspoId((option as {value: string; label: string}).value);
    if (sensors && sensors.length === 1) {
      setUnitData((currentUnit) => ({...currentUnit, uuid: sensors[0].unit_uuid}));
    }
  };

  const handleSensorUUID = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUnitData({
      ...unitData,
      uuid: event.target.value,
    });
  };

  const handleDateChange = (date: Date) => {
    trigger('unit');
    setUnitData({
      ...unitData,
      fra: date,
    });
  };

  const handleAddUnit = (payload: UnitPost) => {
    addUnit.mutate(payload, {
      onSuccess: () => {
        toast.success('Udstyr tilføjet');
        queryClient.invalidateQueries({queryKey: ['metadata', timeseries.ts_id]});
        setUdstyrDialogOpen(false);
        setConfirmDialogOpen(false);
      },
    });
  };

  let handleSave;

  if (mode === 'edit') {
    handleSave = async () => {
      const unit = availableUnits && availableUnits.find((x) => x.unit_uuid === unitData.uuid);

      if (!unit) return;
      const payload = {
        path: `${timeseries.ts_id}`,
        data: {
          unit_uuid: unit.unit_uuid,
          startdate: moment(unitData.fra).toISOString(),
          enddate: moment('2099-01-01T12:00:00').toISOString(),
        },
      };
      if (superUser) {
        const {data} = await apiClient.get(
          `/sensor_field/stamdata/check-unit-invoice/${timeseries.ts_id}/${unit.unit_uuid}`
        );

        if ('ignoreInvoice' in data && data.ignoreInvoice) {
          handleAddUnit(payload);
          return;
        }
        setInvoiceData(data);
        setConfirmDialogOpen(true);
      } else {
        handleAddUnit(payload);
      }
    };
  } else {
    handleSave = () => {
      setUdstyrDialogOpen(false);
      const unit = availableUnits && availableUnits.find((x) => x.unit_uuid === unitData.uuid);

      if (!unit) return;

      setValue('unit', {
        unit_uuid: unit.unit_uuid,
        startdate: moment(unitData.fra).format('YYYY-MM-DD HH:mm:ss'),
      });

      setUnit({
        terminal_type: unit.terminal_type,
        terminal_id: unit.terminal_id,
        sensor_id: unit.sensor_id,
        sensorinfo: unit.sensorinfo,
        parameter: unit.sensorinfo,
        calypso_id: unit.calypso_id,
        batteriskift: unit.batteriskift,
        startdato: unitData.fra,
        slutdato: '2099-01-01 12:00:00',
        uuid: unit.unit_uuid,
        gid: -1,
      });
    };
  }

  const handleClose = () => {
    setUdstyrDialogOpen(false);
  };

  useEffect(() => {
    if (udstyrDialogOpen === true)
      setUnitData((currentUnit) => ({...currentUnit, fra: new Date()}));
  }, [udstyrDialogOpen, setUnitData]);

  return (
    <>
      {openCaptureDialog && (
        <CaptureDialog
          open={openCaptureDialog}
          handleClose={() => setOpenCaptureDialog(false)}
          handleScan={(data: any) => {
            const split = data['text'].split('/');
            const calypso_id = parseInt(split[split.length - 1]);

            if (isNaN(calypso_id)) {
              toast.error('Ugyldigt Calypso ID');
              setOpenCaptureDialog(false);
              return;
            }
            const exists = uniqueCalypsoIds.includes(calypso_id.toString());

            if (!exists) {
              toast.error(`Ingen tilgængelige enheder med Calypso ID: ${calypso_id}`);
              setOpenCaptureDialog(false);
              return;
            }

            handleCalypsoIdNew({value: calypso_id.toString(), label: calypso_id.toString()});
            setOpenCaptureDialog(false);
          }}
        />
      )}
      <Dialog open={udstyrDialogOpen} onClose={handleClose} aria-labelledby="form-dialog-title">
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <DialogTitle id="form-dialog-title">Tilføj Udstyr</DialogTitle>
            <DialogContent>
              {uniqueCalypsoIds.length === 0 && (
                <Typography variant="subtitle2" component="h3" color="error">
                  * ingen enheder der passer til tidsserietypen er tilgængelig
                </Typography>
              )}

              <Box
                display={'flex'}
                flexDirection={'row'}
                justifyContent={'space-between'}
                alignItems={'center'}
              >
                <Autocomplete
                  id="calypso_id"
                  labelKey="label"
                  textFieldsProps={{
                    label: 'Calypso ID',
                    placeholder: 'Søg Calypso ID',
                  }}
                  options={uniqueCalypsoIds.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  selectValue={
                    unitData.calypso_id
                      ? {value: unitData.calypso_id, label: unitData.calypso_id}
                      : {value: '', label: ''}
                  }
                  onChange={handleCalypsoIdNew}
                />
                <IconButton color="inherit" onClick={() => setOpenCaptureDialog(true)} size="large">
                  <QrCodeScannerIcon />
                </IconButton>
              </Box>
              <TextField
                select
                margin="dense"
                value={unitData.uuid}
                onChange={handleSensorUUID}
                id="sensor_id"
                label="Sensor / Sensor ID"
                fullWidth
                sx={{mb: 2}}
              >
                <MenuItem key={-1} value={''}>
                  Vælg Sensor ID
                </MenuItem>
                {sensorsForCalyspoId(unitData.calypso_id)?.map((option) => (
                  <MenuItem key={option.unit_uuid} value={option.unit_uuid}>
                    {option.channel} - {option.sensortypename}
                  </MenuItem>
                ))}
              </TextField>
              <OwnDatePicker
                label={'Fra'}
                value={unitData.fra}
                onChange={(date: Date) => handleDateChange(date)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} bttype="tertiary">
                Annuller
              </Button>
              <Button
                onClick={handleSave}
                bttype="primary"
                startIcon={mode === 'edit' ? <Save /> : undefined}
                disabled={unitData.calypso_id === '-1' || unitData.uuid === ''}
              >
                {mode === 'edit' ? 'Gem' : 'tilføj'}
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
      <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
        <DialogContent>
          <Typography>Følgende faktureringsinformation findes på tidligere enhed</Typography>
          <Typography>
            <strong>Terminal:</strong> {invoiceData?.terminal_id}
          </Typography>
          <Typography>
            <strong>Pris pr måned:</strong> {invoiceData?.amount}
          </Typography>
          <Typography>
            <strong>Subscription type:</strong> {invoiceData?.subscription_type}
          </Typography>
          <Typography>Vil du overføre fakturering til den nye enhed?</Typography>
        </DialogContent>
        <DialogActions>
          <Button
            onClick={() => {
              setConfirmDialogOpen(false);
            }}
            bttype="tertiary"
          >
            Annuller
          </Button>
          <Button
            onClick={() =>
              handleAddUnit({
                path: `${timeseries.ts_id}`,
                data: {
                  unit_uuid: unitData?.uuid,
                  startdate: moment(unitData.fra).toISOString(),
                  enddate: moment('2099-01-01T12:00:00').toISOString(),
                  inherit_invoice: false,
                },
              })
            }
            bttype="tertiary"
          >
            Nej
          </Button>
          <Button
            onClick={() =>
              handleAddUnit({
                path: `${timeseries.ts_id}`,
                data: {
                  unit_uuid: unitData?.uuid,
                  startdate: moment(unitData.fra).toISOString(),
                  enddate: moment('2099-01-01T12:00:00').toISOString(),
                  inherit_invoice: true,
                },
              })
            }
            bttype="primary"
          >
            Ja
          </Button>
        </DialogActions>
      </Dialog>
    </>
  );
}
