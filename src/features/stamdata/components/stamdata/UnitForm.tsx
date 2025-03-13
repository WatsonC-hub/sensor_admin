import {Grid} from '@mui/material';
import moment from 'moment';
import React from 'react';
import {useFormContext} from 'react-hook-form';

import FormInput from '~/components/FormInput';
import FormTextField from '~/components/FormTextField';

import {Unit, useUnit} from '../../api/useAddUnit';
import {UnitHistory, useUnitHistory} from '../../api/useUnitHistory';
import {useAppContext} from '~/state/contexts';
import usePermissions from '~/features/permissions/api/usePermissions';

interface UnitFormProps {
  mode: string;
}

export default function UnitForm({mode}: UnitFormProps) {
  const {watch} = useFormContext();
  const editMode = mode === 'edit';

  const {loc_id} = useAppContext([], ['loc_id']);
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';

  const startdate = watch('unit.startdate');
  // const enddate = watch('unit.enddate');
  const unit_uuid: string = watch('unit.unit_uuid');

  const {
    get: {data: availableUnits},
  } = useUnit();

  const {data: history} = useUnitHistory();
  let unit: UnitHistory | Unit | undefined;
  if (editMode) {
    unit = history?.find((u) => u.uuid === unit_uuid);
  } else {
    unit = availableUnits?.find((u) => u.unit_uuid === unit_uuid);
  }

  // useEffect(() => {
  //   if (getFieldState('unit.startdate').error || getFieldState('unit.enddate').error)
  //     trigger('unit');
  // }, [startdate, enddate]);

  return (
    <Grid container spacing={2} alignItems="center" justifyContent="center">
      <Grid item xs={12} sm={6}>
        <FormTextField disabled value={unit?.terminal_type ?? ''} label="Terminal" />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="Terminal ID" value={unit?.terminal_id ?? ''} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField
          disabled
          label="CALYPSO ID"
          value={unit?.calypso_id ? String(unit?.calypso_id) : ''}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="Sensor" value={unit?.sensorinfo ?? ''} />
      </Grid>
      <Grid item xs={12} sm={6}>
        <FormTextField disabled label="Sensor ID" value={unit?.sensor_id ?? ''} />
      </Grid>
      <Grid item xs={12} sm={3}>
        <FormInput
          name="unit.startdate"
          label="Startdato"
          disabled={!unit || startdate === undefined || disabled}
          fullWidth
          type="datetime-local"
          required
        />
      </Grid>
      <Grid item xs={12} sm={3}>
        {editMode && (
          <FormInput
            name="unit.enddate"
            label="Slutdato"
            fullWidth
            disabled={!unit || startdate === undefined || disabled}
            type="datetime-local"
            required
            inputProps={{min: moment(startdate).format('YYYY-MM-DDTHH:mm')}}
          />
        )}
      </Grid>
    </Grid>
  );
}
