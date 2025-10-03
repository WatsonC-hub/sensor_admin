import {Save} from '@mui/icons-material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {CircularProgress, MenuItem, Typography, Box, IconButton} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {PickerValue} from '@mui/x-date-pickers/internals';
import dayjs from 'dayjs';

import React, {ChangeEvent, SyntheticEvent, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Autocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import CaptureDialog from '~/components/CaptureDialog';
import OwnDatePicker from '~/components/OwnDatePicker';
import {useUser} from '~/features/auth/useUser';
import {UnitPost, useUnit} from '~/features/stamdata/api/useAddUnit';
import {AddUnit} from '~/features/station/schema';
import {useAppContext} from '~/state/contexts';

interface AddUnitFormProps {
  udstyrDialogOpen: boolean;
  setUdstyrDialogOpen: (open: boolean) => void;
  tstype_id?: number;
  mode: string;
}

export default function AddUnitForm({
  udstyrDialogOpen,
  setUdstyrDialogOpen,
  tstype_id,
  mode,
}: AddUnitFormProps) {
  const {ts_id} = useAppContext([], ['ts_id']);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    terminal_id: number;
    amount: number;
    subscription_type: string;
  } | null>(null);
  const [openCaptureDialog, setOpenCaptureDialog] = useState(false);
  const user = useUser();

  const {
    get: {data: availableUnits, isLoading},
    post: addUnit,
  } = useUnit();

  const {
    trigger,
    setValue,
    handleSubmit,
    formState: {isSubmitting, isSubmitSuccessful, isSubmitted},
  } = useFormContext<AddUnit>();

  const [unitData, setUnitData] = useState({
    calypso_id: '',
    sensor_id: '',
    uuid: '',
    fra: dayjs(),
  });

  const uniqueCalypsoIds = [
    ...new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((x) => (x.calypso_id == 0 ? x.terminal_id : x.calypso_id.toString()))
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

  const sensorsForCalyspoId = (id: string | number) =>
    availableUnits?.filter(
      (unit) =>
        (unit.calypso_id.toString() === id.toString() || unit.terminal_id === id) &&
        unit.sensortypeid === tstype_id
    );

  const handleCalypsoIdNew = (
    option: {value: string; label: string} | SyntheticEvent<Element> | null
  ) => {
    if (option == null) {
      setUnitData((currentUnit) => ({...currentUnit, calypso_id: '', uuid: ''}));
      setValue('unit_uuid', '', {shouldDirty: true});
      setValue('startdate', undefined, {shouldDirty: true});
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
      setValue('unit_uuid', sensors[0].unit_uuid, {shouldDirty: true});
      setValue('startdate', dayjs(unitData.fra), {
        shouldDirty: true,
      });
    }
  };

  const handleSensorUUID = (event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setUnitData({...unitData, uuid: event.target.value});
    setUnitData({...unitData, uuid: event.target.value});
  };

  const handleDateChange = (date: PickerValue) => {
    trigger();
    setUnitData({...unitData, fra: dayjs(date)});
  };

  const handleAddUnit = (payload: UnitPost) => {
    addUnit.mutate(payload, {
      onSuccess: () => {
        toast.success('Udstyr tilføjet');
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
        path: `${ts_id}`,
        data: {
          unit_uuid: unit.unit_uuid,
          startdate: dayjs(unitData.fra),
          enddate: dayjs('2099-01-01T12:00:00'),
        },
      };
      if (user?.superUser) {
        const {data} = await apiClient.get(
          `/sensor_field/stamdata/check-unit-invoice/${ts_id}/${unit.unit_uuid}`
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
    handleSave = async () => {
      setUdstyrDialogOpen(false);
      const unit = availableUnits && availableUnits.find((x) => x.unit_uuid === unitData.uuid);

      if (!unit) return;

      setValue('unit_uuid', unit.unit_uuid, {shouldDirty: true});
      setValue('startdate', dayjs(unitData.fra), {
        shouldDirty: true,
      });

      // setUnit({
      //   terminal_type: unit.terminal_type,
      //   terminal_id: unit.terminal_id,
      //   sensor_id: unit.sensor_id,
      //   sensorinfo: unit.sensorinfo,
      //   parameter: unit.sensorinfo,
      //   calypso_id: unit.calypso_id,
      //   batteriskift: unit.batteriskift,
      //   startdato: unitData.fra,
      //   slutdato: '2099-01-01 12:00:00',
      //   uuid: unit.unit_uuid,
      //   gid: -1,
      // });
    };
  }

  const handleClose = () => {
    setUdstyrDialogOpen(false);
  };

  useEffect(() => {
    if (udstyrDialogOpen === true) setUnitData((currentUnit) => ({...currentUnit, fra: dayjs()}));
  }, [udstyrDialogOpen, setUnitData]);

  return (
    <>
      {openCaptureDialog && (
        <CaptureDialog
          open={openCaptureDialog}
          handleClose={() => setOpenCaptureDialog(false)}
          handleScan={(data: any, calypso_id: number | null) => {
            if (calypso_id === null) {
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
                  textFieldsProps={{label: 'Calypso ID', placeholder: 'Søg Calypso ID'}}
                  options={uniqueCalypsoIds.map((option) => ({value: option, label: option}))}
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
                    {option.signal_id} - {option.sensortypename}
                  </MenuItem>
                ))}
              </TextField>
              <OwnDatePicker
                label={'Fra'}
                value={dayjs(unitData.fra)}
                onChange={(date) => handleDateChange(date)}
              />
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} bttype="tertiary">
                Annuller
              </Button>
              <Button
                onClick={handleSubmit(
                  async (e) => {
                    console.log('submit', e);
                    await handleSave();
                  },
                  (e) => console.log(e)
                )}
                bttype="primary"
                startIcon={mode === 'edit' ? <Save /> : undefined}
                disabled={
                  isSubmitting ||
                  isSubmitSuccessful ||
                  isSubmitted ||
                  unitData.calypso_id === '-1' ||
                  unitData.uuid === ''
                }
              >
                {mode === 'edit' ? 'Gem' : 'Tilføj'}
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
                path: `${ts_id}`,
                data: {
                  unit_uuid: unitData?.uuid,
                  startdate: dayjs(unitData.fra),
                  enddate: dayjs('2099-01-01T12:00:00'),
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
                path: `${ts_id}`,
                data: {
                  unit_uuid: unitData?.uuid,
                  startdate: dayjs(unitData.fra),
                  enddate: dayjs('2099-01-01T12:00:00'),
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
