import QrCodeScannerIcon from '@mui/icons-material/QrCodeScanner';
import {CircularProgress, MenuItem, Typography, Box, IconButton} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Autocomplete from '~/components/Autocomplete';
import Button from '~/components/Button';
import CaptureDialog from '~/components/CaptureDialog';
import OwnDatePicker from '~/components/OwnDatePicker';
import {authStore, stamdataStore} from '~/state/store';

export default function AddUnitForm({udstyrDialogOpen, setUdstyrDialogOpen, tstype_id, mode}) {
  const [timeseries, setUnit] = stamdataStore((store) => [store.timeseries, store.setUnit]);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const [invoiceData, setInvoiceData] = useState(null);
  const queryClient = useQueryClient();
  const [openCaptureDialog, setOpenCaptureDialog] = useState(false);
  // const params = useParams();

  const superUser = authStore((state) => state.superUser);
  // const {data: metadata} = useMetadata(params.ts_id);
  const {data: availableUnits, isLoading} = useQuery({
    queryKey: ['available_units'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/stamdata/available_units`);
      return data;
    },
  });

  const addUnit = useMutation({
    mutationFn: async (data) => {
      const {data: out} = await apiClient.post(
        `/sensor_field/stamdata/unit_history/${timeseries.ts_id}`,
        data
      );
      return out;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('udstyr');
    },
  });

  const formMethods = useFormContext();

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
        ?.map((x) => (x.calypso_id == 0 ? x.terminal_id : x.calypso_id))
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
  });

  const sensorsForCalyspoId = (id) =>
    availableUnits?.filter(
      (unit) =>
        (unit.calypso_id === id || unit.terminal_id === id) && unit.sensortypeid === tstype_id
    );

  const handleCalypsoIdNew = (option) => {
    console.log('option', option);
    if (option == null) {
      setUnitData((currentUnit) => ({...currentUnit, calypso_id: '', uuid: ''}));
      return;
    }
    setUnitData((currentUnit) => ({...currentUnit, calypso_id: option.value, uuid: ''}));

    const sensors = sensorsForCalyspoId(option.value);
    if (sensors.length === 1) {
      setUnitData((currentUnit) => ({...currentUnit, uuid: sensors[0].unit_uuid}));
    }
  };

  const handleSensorUUID = (event) => {
    setUnitData({
      ...unitData,
      uuid: event.target.value,
    });
  };

  const handleDateChange = (date) => {
    formMethods.trigger('unit');
    setUnitData({
      ...unitData,
      fra: date,
    });
  };

  const handleAddUnit = (payload) => {
    addUnit.mutate(payload, {
      onSuccess: () => {
        toast.success('Udstyr tilføjet');
        setUdstyrDialogOpen(false);
        setConfirmDialogOpen(false);
      },
    });
  };

  let handleSave = () => null;

  if (mode === 'edit') {
    handleSave = async () => {
      let unit = availableUnits.find((x) => x.unit_uuid === unitData.uuid);

      if (!unit) return;
      const payload = {
        unit_uuid: unit.unit_uuid,
        startdate: moment(unitData.fra).toISOString(),
        enddate: moment('2099-01-01T12:00:00').toISOString(),
      };
      if (superUser) {
        const {data} = await apiClient.get(
          `/sensor_field/stamdata/check-unit-invoice/${timeseries.ts_id}/${unit.unit_uuid}`
        );

        if ('exists' in data && data.exists) {
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
      let unit = availableUnits.find((x) => x.unit_uuid === unitData.uuid);

      if (!unit) return;

      formMethods.trigger('unit');
      formMethods.setValue('unit', {
        unit_uuid: unit.unit_uuid,
        startdate: moment(unitData.fra).format('YYYY-MM-DD HH:mm:ss'),
      });

      setUnit({
        terminal_type: unit.type,
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
          handleScan={(data) => {
            const split = data['text'].split('/');
            const calypso_id = parseInt(split[split.length - 1]);

            if (isNaN(calypso_id)) {
              toast.error('Ugyldigt Calypso ID');
              setOpenCaptureDialog(false);
              return;
            }
            const exists = uniqueCalypsoIds.includes(calypso_id);

            if (!exists) {
              toast.error(`Ingen tilgængelige enheder med Calypso ID: ${calypso_id}`);
              setOpenCaptureDialog(false);
              return;
            }

            handleCalypsoIdNew({value: calypso_id, label: calypso_id});
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
                  label="Calypso ID"
                  labelKey="label"
                  placeholder="Søg Calypso ID"
                  options={uniqueCalypsoIds.map((option) => ({
                    value: option,
                    label: option,
                  }))}
                  selectValue={
                    unitData.calypso_id
                      ? {value: unitData.calypso_id, label: unitData.calypso_id}
                      : null
                  }
                  onChange={handleCalypsoIdNew}
                />
                <IconButton color="inherit" onClick={() => setOpenCaptureDialog(true)} size="large">
                  <QrCodeScannerIcon />
                </IconButton>
              </Box>

              {/* <TextField
                select
                margin="dense"
                value={unitData.calypso_id}
                onChange={handleCalypsoId}
                id="calypso_id"
                label="Calypso ID"
                fullWidth
              >
                <MenuItem key={-1} value={-1}>
                  Vælg calypso ID
                </MenuItem>
                {uniqueCalypsoIds?.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField> */}

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
                onChange={(date) => handleDateChange(date)}
              />
              {/* {superUser && metadata?.unit_uuid && (
              <Box>
                <FormControl>
                  <FormLabel id="inherit_invoice">Overtag fakturering</FormLabel>
                  <RadioGroup
                    aria-labelledby="inherit_invoice"
                    name="inherit_invoice"
                    value={inheritInvoice}
                    onChange={(e) => setInheritInvoice(e.target.value)}
                  >
                    <FormControlLabel value={true} control={<Radio />} label="Ja" />
                    <FormControlLabel value={false} control={<Radio />} label="Nej" />
                  </RadioGroup>
                </FormControl>
              </Box>
            )} */}
            </DialogContent>
            <DialogActions>
              <Button onClick={handleClose} bttype="tertiary">
                Annuller
              </Button>
              <Button
                onClick={handleSave}
                bttype="primary"
                disabled={unitData.calypso_id === -1 || unitData.uuid === ''}
              >
                Tilføj
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
                unit_uuid: unitData?.uuid,
                startdate: moment(unitData.fra).toISOString(),
                enddate: moment('2099-01-01T12:00:00').toISOString,
                inherit_invoice: false,
              })
            }
            bttype="tertiary"
          >
            Nej
          </Button>
          <Button
            onClick={() =>
              handleAddUnit({
                unit_uuid: unitData?.uuid,
                startdate: moment(unitData.fra).toISOString(),
                enddate: moment('2099-01-01T12:00:00').toISOString,
                inherit_invoice: true,
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
