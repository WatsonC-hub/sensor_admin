import React from 'react';
import {MobileDateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import daLocale from 'date-fns/locale/da';
import {TextField} from '@mui/material';
import moment from 'moment/moment';

const OwnDatePicker = (props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={daLocale}>
      <TextField
        id={props.label}
        label={props.label}
        type="datetime-local"
        error={props.error}
        helperText={props.helperText}
        disabled={props.disabled}
        value={moment(props.value).format('YYYY-MM-DDTHH:mm')}
        onChange={(e) => props.onChange(moment(e.target.value).toDate())}
        sx={props.error ? {} : props.sx}
        inputProps={{
          max: props.max ? moment(props.max).format('YYYY-MM-DDTHH:mm:ss') : null,
          min: props.min ? moment(props.min).format('YYYY-MM-DDTHH:mm:ss') : null,
        }}
        InputLabelProps={{
          shrink: true,
        }}
        fullWidth={props.fullWidth}
        margin="dense"
      />
    </LocalizationProvider>
  );
};

export default OwnDatePicker;
