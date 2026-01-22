import React, {SyntheticEvent, useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import dayjs from 'dayjs';
import {toast} from 'react-toastify';

import {Save} from '@mui/icons-material';
import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {
  Box,
  CircularProgress,
  Dialog,
  DialogActions,
  DialogContent,
  DialogTitle,
  IconButton,
  MenuItem,
  TextField,
  Typography,
} from '@mui/material';

import Autocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import CaptureDialog from '~/components/CaptureDialog';
import OwnDatePicker from '~/components/OwnDatePicker';
import {apiClient} from '~/apiClient';
import {useUser} from '~/features/auth/useUser';
import {useAppContext} from '~/state/contexts';
import {Unit, UnitPost, useUnit} from '~/features/stamdata/api/useAddUnit';
import AddSensorDialog from './AddSensorDialog';

interface AddUnitFormProps {
  udstyrDialogOpen: boolean;
  setUdstyrDialogOpen: (open: boolean) => void;
  tstype_id?: number;
  mode: 'add' | 'edit';
  onValidate?: (unit: Unit) => void;
}

export default function AddUnitForm({
  udstyrDialogOpen,
  setUdstyrDialogOpen,
  mode,
  tstype_id,
  onValidate,
}: AddUnitFormProps) {
  const [addSensors, setAddSensors] = useState(false);
  const [disableMatchingParameters, setDisableMatchingParameters] = useState(true);
  const {ts_id} = useAppContext([], ['ts_id']);
  const {superUser} = useUser();

  const {
    get: {data: availableUnits, isLoading},
    post: addUnit,
  } = useUnit();

  const {
    setValue,
    handleSubmit,
    reset,
    trigger,
    formState: {isSubmitting},
  } = useFormContext();

  const [unitData, setUnitData] = useState({
    calypso_id: '',
    uuid: '',
    fra: dayjs(),
  });

  const [openCaptureDialog, setOpenCaptureDialog] = useState(false);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState<{
    terminal_id: number;
    amount: number;
    subscription_type: string;
  } | null>(null);

  const uniqueCalypsoIds = [
    ...new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((x) => (x.calypso_id === 0 ? x.terminal_id.toString() : x.calypso_id.toString()))
    ),
  ].sort();

  const sensorsForCalyspoId = (id: string | number) =>
    availableUnits?.filter(
      (unit) =>
        (unit.calypso_id.toString() === id.toString() || unit.terminal_id === id) &&
        unit.sensortypeid === tstype_id
    );

  const handleCalypsoIdChange = (
    option: {value: string; label: string} | SyntheticEvent<Element> | null
  ) => {
    if (!option) {
      setUnitData({calypso_id: '', uuid: '', fra: unitData.fra});
      return;
    }

    const value = (option as {value: string; label: string}).value;
    setUnitData((prev) => ({...prev, calypso_id: value, uuid: ''}));

    const sensors = sensorsForCalyspoId(value);
    if (sensors && sensors.length === 1) {
      setUnitData((prev) => ({...prev, uuid: sensors[0].unit_uuid}));
      if (mode === 'edit') {
        setValue('unit_uuid', sensors[0].unit_uuid, {shouldDirty: true});
        setValue('startdate', dayjs(), {shouldDirty: true});
      }
    }
  };

  const handleSensorUUIDChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setUnitData((prev) => ({...prev, uuid: e.target.value}));
    if (mode === 'edit') {
      setValue('unit_uuid', e.target.value, {shouldDirty: true});
      setValue('startdate', dayjs(), {shouldDirty: true});
    }
  };

  const handleDateChange = (date: any) => {
    setUnitData((prev) => ({...prev, fra: dayjs(date)}));
    if (mode === 'edit') setValue('startdate', dayjs(date), {shouldDirty: true});
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

  const handleSaveOnEdit = async () => {
    const isValid = await trigger();
    if (!isValid) return;

    const unit = availableUnits?.find((x) => x.unit_uuid === unitData.uuid);
    if (!unit) return;
    const payload = {
      path: `${ts_id}`,
      data: {
        unit_uuid: unit.unit_uuid,
        startdate: dayjs(unitData.fra),
        enddate: dayjs('2099-01-01T12:00:00'),
      },
    };

    if (superUser) {
      const {data} = await apiClient.get(
        `/sensor_field/stamdata/check-unit-invoice/${ts_id}/${unit.unit_uuid}`
      );
      if (data?.ignoreInvoice) {
        handleAddUnit(payload);
        return;
      }
      setInvoiceData(data);
      setConfirmDialogOpen(true);
    } else {
      handleAddUnit(payload);
    }
  };

  const handleSaveOnAdd = async () => {
    const units = availableUnits?.filter(
      (x) =>
        x.calypso_id.toString() === unitData.calypso_id || x.terminal_id === unitData.calypso_id
    );

    if (!units || units.length === 0) return;

    const unit = units.find((u) => u.unit_uuid === unitData.uuid);
    if (units.length === 1) {
      setUnitData((prev) => ({...prev, uuid: units[0].unit_uuid}));
      if (mode === 'add' && unit && onValidate) {
        console.log('ON VALIDATE UNIT:', unit);
        onValidate(unit);
      }
      setValue('unit_uuid', units[0].unit_uuid, {shouldDirty: true, shouldValidate: true});
      setValue('startdate', dayjs(unitData.fra), {shouldDirty: true, shouldValidate: true});

      const isValid = await trigger();
      if (!isValid) return;
      setUdstyrDialogOpen(false);
      toast.success('Udstyr tilføjet til formularen');
    } else if (units.length > 1) {
      const matchingParameters = units.filter((u) => u.sensor_id === unit?.sensor_id).length === 1;
      setDisableMatchingParameters(matchingParameters);

      if (mode !== 'add') setAddSensors(true);
      else {
        handleSensorDialogClose();
      }
    }
  };

  const handleClose = () => {
    setUdstyrDialogOpen(false);
    if (!onValidate) {
      setUnitData({calypso_id: '', uuid: '', fra: dayjs()});
      trigger();
      reset();
    }
  };

  const handleSensorDialogClose = async (matchingParameters?: boolean) => {
    setAddSensors(false);

    const sensortypeList = sensorsForCalyspoId(unitData.calypso_id);
    const unit = sensortypeList?.find((u) => u.unit_uuid === unitData.uuid);
    if (matchingParameters) {
      if (mode === 'add' && unit && onValidate) {
        onValidate(unit);
      }
    } else if (matchingParameters === false) {
      if (mode === 'add' && unit && onValidate) {
        onValidate(unit);
      }
    } else if (matchingParameters === undefined) {
      if (mode === 'add' && onValidate && unit) {
        onValidate(unit);
      }
    }

    setValue('unit_uuid', unit?.unit_uuid, {shouldDirty: true, shouldValidate: true});
    setValue('startdate', dayjs(unitData.fra), {shouldDirty: true, shouldValidate: true});

    const isValid = await trigger();
    if (!isValid) return;
    setUdstyrDialogOpen(false);
    toast.success('Udstyr tilføjet til formularen');
  };

  useEffect(() => {
    if (udstyrDialogOpen) setUnitData((prev) => ({...prev, fra: dayjs()}));
  }, [udstyrDialogOpen]);

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

            if (!uniqueCalypsoIds.includes(calypso_id.toString())) {
              toast.error(`Ingen tilgængelige enheder med Calypso ID: ${calypso_id}`);
              setOpenCaptureDialog(false);
              return;
            }

            if (mode !== 'edit') {
              setUnitData((prev) => ({...prev, calypso_id: calypso_id.toString()}));
              handleSaveOnAdd();
              setOpenCaptureDialog(false);
              return;
            }

            handleCalypsoIdChange({value: calypso_id.toString(), label: calypso_id.toString()});
            setOpenCaptureDialog(false);
          }}
        />
      )}

      <AddSensorDialog
        open={addSensors}
        onClose={handleSensorDialogClose}
        isDisassembling={mode !== 'add'}
        disableMatchingParameters={disableMatchingParameters}
      />

      <Dialog open={udstyrDialogOpen} onClose={handleClose}>
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <DialogTitle>Tilføj Udstyr</DialogTitle>
            <DialogContent>
              {uniqueCalypsoIds.length === 0 && (
                <Typography color="error" variant="subtitle2">
                  * ingen enheder der passer til tidsserietypen er tilgængelig
                </Typography>
              )}

              <Box display="flex" justifyContent="space-between" alignItems="center">
                <Autocomplete
                  id="calypso_id"
                  labelKey="label"
                  textFieldsProps={{label: 'Calypso ID', placeholder: 'Søg Calypso ID'}}
                  options={uniqueCalypsoIds.map((v) => ({value: v, label: v}))}
                  selectValue={
                    unitData.calypso_id
                      ? {value: unitData.calypso_id, label: unitData.calypso_id}
                      : {value: '', label: ''}
                  }
                  onChange={handleCalypsoIdChange}
                />
                <IconButton onClick={() => setOpenCaptureDialog(true)} size="large">
                  <QrCodeScannerIcon />
                </IconButton>
              </Box>

              <TextField
                select
                value={unitData.uuid}
                onChange={handleSensorUUIDChange}
                fullWidth
                label="Sensor / Sensor ID"
                margin="dense"
              >
                <MenuItem value="">Vælg Sensor ID</MenuItem>
                {sensorsForCalyspoId(unitData.calypso_id)?.map((option) => (
                  <MenuItem key={option.unit_uuid} value={option.unit_uuid}>
                    {option.signal_id} - {option.sensortypename}
                  </MenuItem>
                ))}
              </TextField>

              <OwnDatePicker
                label="Fra"
                value={dayjs(unitData.fra)}
                onChange={handleDateChange}
                helperText={!unitData.fra.isValid() ? 'Fejl i dato' : ''}
              />
            </DialogContent>

            <DialogActions>
              <Button onClick={handleClose} bttype="tertiary">
                Annuller
              </Button>
              <Button
                onClick={
                  mode === 'edit'
                    ? handleSubmit(handleSaveOnEdit, (e) => {
                        console.log('Validation errors', e);
                      })
                    : handleSaveOnAdd
                }
                bttype="primary"
                startIcon={mode === 'edit' ? <Save /> : undefined}
                disabled={
                  !unitData.calypso_id || !unitData.uuid || !unitData.fra.isValid() || isSubmitting
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
          <Button onClick={() => setConfirmDialogOpen(false)} bttype="tertiary">
            Annuller
          </Button>
          <Button
            onClick={() =>
              handleAddUnit({
                path: `${ts_id}`,
                data: {
                  unit_uuid: unitData.uuid,
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
                  unit_uuid: unitData.uuid,
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
