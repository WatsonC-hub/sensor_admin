import {Grid, Grid2} from '@mui/material';
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

  const startdato = watch('startdate');
  // const enddato = watch('unit.enddato');
  const unit_uuid: string = watch('unit_uuid');

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
    <Grid2 container spacing={2} width={'100%'}>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormTextField disabled value={unit?.terminal_type ?? ''} label="Terminal" />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormTextField disabled label="Terminal ID" value={unit?.terminal_id ?? ''} />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormTextField
          disabled
          label="CALYPSO ID"
          value={unit?.calypso_id ? String(unit?.calypso_id) : ''}
        />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormTextField disabled label="Sensor" value={unit?.sensorinfo ?? ''} />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormTextField disabled label="Sensor ID" value={unit?.sensor_id ?? ''} />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}></Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        <FormInput
          name="startdate"
          label="Startdato"
          disabled={!unit || startdato === undefined || disabled}
          fullWidth
          type="datetime-local"
          required
          sx={{minWidth: '210px'}}
        />
      </Grid2>
      <Grid2 size={{xs: 12, sm: 6}}>
        {editMode && (
          <FormInput
            name="enddate"
            label="Slutdato"
            fullWidth
            disabled={!unit || startdato === undefined || disabled}
            type="datetime-local"
            required
            inputProps={{min: moment(startdato).format('YYYY-MM-DDTHH:mm')}}
            sx={{minWidth: '210px'}}
          />
        )}
      </Grid2>
    </Grid2>
  );
}
