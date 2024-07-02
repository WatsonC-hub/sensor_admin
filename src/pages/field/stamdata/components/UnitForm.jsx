import {Grid} from '@mui/material';
import moment from 'moment';
import React, {useEffect} from 'react';
import {useFormContext} from 'react-hook-form';

import FormInput from '~/components/FormInput';
import {stamdataStore} from '~/state/store';

import FormTextField from './FormTextField';

export default function UnitForm({mode}) {
  const {watch, trigger, getFieldState} = useFormContext();
  const editMode = mode === 'edit';

  const [unit] = stamdataStore((store) => [store.unit]);
  const startdate = watch('unit.startdate');
  const enddate = watch('unit.enddate');

  useEffect(() => {
    if (getFieldState('unit.startdate').error && getFieldState('unit.enddate').error)
      trigger('unit');
  }, [startdate, enddate]);

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormTextField disabled value={unit.terminal_type} label="Terminal" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="Terminal ID" value={unit.terminal_id} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="CALYPSO ID" value={unit.calypso_id} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="Sensor" value={unit.sensorinfo} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="Sensor ID" value={unit.sensor_id} />
      </Grid>
      <Grid item xs={12} sm={3}>
        {!editMode ? (
          <FormTextField
            disabled
            label="Startdato"
            value={unit.startdato ? moment(unit.startdato).format('YYYY-MM-DD HH:mm') : ''}
          />
        ) : (
          <FormInput
            name="unit.startdate"
            label="Startdato"
            disabled={unit && !unit.gid}
            fullWidth
            type="datetime-local"
            required
          />
        )}
      </Grid>
      <Grid item xs={12} sm={3}>
        {editMode && (
          <FormInput
            name="unit.enddate"
            label="Slutdato"
            fullWidth
            disabled={unit && !unit.gid}
            type="datetime-local"
            required
            inputProps={{
              min: moment(startdate).format('YYYY-MM-DDTHH:mm:ss'),
            }}
          />
        )}
      </Grid>
    </Grid>
  );
}
