import React from 'react';
import {Grid, TextField} from '@mui/material';
import 'date-fns';
import moment from 'moment';
import OwnDatePicker from '../../../../components/OwnDatePicker';
import {stamdataStore} from '../../../../state/store';
import FormTextField from './FormTextField';

export default function UdstyrForm(props) {
  const editMode = props.mode === 'edit';

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
          <OwnDatePicker
            label="Startdato"
            value={moment(unit.startdato)}
            onChange={(date) => setUnitValue('startdato', moment(date).format('YYYY-MM-DD HH:mm'))}
          />
        )}
      </Grid>
      <Grid item xs={12} sm={3}>
        {editMode && (
          <OwnDatePicker
            label="Slutdato"
            value={moment(unit.slutdato)}
            onChange={(date) => setUnitValue('slutdato', moment(date).format('YYYY-MM-DD HH:mm'))}
          />
        )}
      </Grid>
    </Grid>
  );
}
