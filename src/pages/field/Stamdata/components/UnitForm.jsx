import React from 'react';
import {Grid, TextField} from '@mui/material';
import 'date-fns';
import moment from 'moment';
import OwnDatePicker from 'src/components/OwnDatePicker';
import {stamdataStore} from 'src/state/store';
import FormTextField from './FormTextField';
import FormInput from 'src/components/FormInput';
import {useFormContext} from 'react-hook-form';

export default function UnitForm({mode}) {
  const editMode = mode === 'edit';

  const formMethods = useFormContext();

  const [unit, setUnitValue] = stamdataStore((store) => [store.unit, store.setUnitValue]);

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
            type="datetime-local"
            required
          />
        )}
      </Grid>
    </Grid>
  );
}
