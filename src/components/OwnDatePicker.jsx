import {TextField} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
// import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import daLocale from 'dayjs/locale/da';
import moment from 'moment/moment';
import React from 'react';

const OwnDatePicker = (props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDayjs} adapterLocale={daLocale}>
      <TextField
        id={typeof props.label == 'string' ? props.label : props.label.props.children}
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
