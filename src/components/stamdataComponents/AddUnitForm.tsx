import {CircularProgress, MenuItem, Typography} from '@mui/material';
import Dialog from '@mui/material/Dialog';
import DialogActions from '@mui/material/DialogActions';
import DialogContent from '@mui/material/DialogContent';
import DialogTitle from '@mui/material/DialogTitle';
import TextField from '@mui/material/TextField';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {ChangeEvent, useState} from 'react';
import {useFormContext} from 'react-hook-form';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import Button from '~/components/Button';

import {stamdataStore} from '../../state/store';
import OwnDatePicker from '../OwnDatePicker';

interface UnitFormProps {
  udstyrDialogOpen: boolean;
  setUdstyrDialogOpen: (value: boolean) => void;
  tstype_id: number;
  mode?: string;
}

type Unit = {
  calypso_id: number;
  channel: number;
  enddate: string;
  org_id_owner: number;
  projectno: string;
  sensor_id: string;
  sensorinfo: string;
  sensortypeid: number;
  sensortypename: string;
  startdate: string;
  terminal_id: string;
  type: string;
  unit_uuid: string;
};

export default function AddUnitForm({
  udstyrDialogOpen,
  setUdstyrDialogOpen,
  tstype_id,
  mode,
}: UnitFormProps) {
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
      queryClient.invalidateQueries({queryKey: ['udstyr']});
    },
  });

  const formMethods = useFormContext();

  const [unitData, setUnitData] = useState({
    calypso_id: '-1',
    sensor_id: '',
    uuid: '',
    fra: new Date(),
  });

  const uniqueCalypsoIds = [
    ...new Set(
      availableUnits
        ?.filter((unit: Unit) => unit.sensortypeid === tstype_id)
        ?.map((x: Unit) => (x.calypso_id == 0 ? x.terminal_id : x.calypso_id))
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
  }) as (string | number)[];

  const sensorsForCalyspoId = (id: string) =>
    availableUnits?.filter(
      (unit: Unit) =>
        (unit.calypso_id.toString() === id || unit.terminal_id === id) &&
        unit.sensortypeid === tstype_id
    );

  const handleCalypsoId = (event: ChangeEvent<HTMLInputElement>) => {
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

  const handleDateChange = (date: Date) => {
    setUnitData({
      ...unitData,
      fra: date,
    });
  };

  let handleSave: () => void;

  if (mode === 'edit') {
    handleSave = () => {
      const unit = availableUnits.find((x: Unit) => x.unit_uuid === unitData.uuid);

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
      const unit = availableUnits.find((x: Unit) => x.unit_uuid === unitData.uuid);

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
                autoFocus
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
                    {option.toString()}
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
                {sensorsForCalyspoId(unitData.calypso_id)?.map((option: Unit) => (
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
                disabled={unitData.calypso_id === '-1' || unitData.uuid === ''}
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
