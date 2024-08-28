import {CircularProgress, MenuItem, Typography} from '@mui/material';
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
import Button from '~/components/Button';

import OwnDatePicker from '../../../components/OwnDatePicker';
import {stamdataStore} from '../../../state/store';

export default function AddUnitForm({udstyrDialogOpen, setUdstyrDialogOpen, tstype_id, mode}) {
  const [timeseries, setUnit] = stamdataStore((store) => [store.timeseries, store.setUnit]);
  const queryClient = useQueryClient();

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
    calypso_id: -1,
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

  const handleCalypsoId = (event) => {
    setUnitData({
      ...unitData,
      calypso_id: event.target.value,
      uuid: '',
    });
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

  let handleSave = () => null;

  if (mode === 'edit') {
    handleSave = () => {
      let unit = availableUnits.find((x) => x.unit_uuid === unitData.uuid);

      if (!unit) return;

      const payload = {
        unit_uuid: unit.unit_uuid,
        startdate: moment(unitData.fra).toISOString(),
        enddate: moment('2099-01-01T12:00:00').toISOString(),
      };

      toast.promise(() => addUnit.mutateAsync(payload), {
        pending: 'Tilføjer udstyr...',
        success: 'Udstyr tilføjet',
        error: 'Der skete en fejl',
      });
      setUdstyrDialogOpen(false);
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
    <div>
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
              <TextField
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
              </TextField>
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
    </div>
  );
}
