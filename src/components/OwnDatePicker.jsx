import {TextField} from '@mui/material';
import {LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDayjs} from '@mui/x-date-pickers/AdapterDayjs';
import daLocale from 'dayjs/locale/da';
import React from 'react';

import {convertDate, toMoment} from '~/helpers/dateConverter';

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
        value={convertDate(props.value, 'YYYY-MM-DDTHH:mm')}
        onChange={(e) => {
          props.onChange(toMoment(e.target.value).toDate());
        }}
        sx={props.error ? {} : props.sx}
        inputProps={{
          max: props.max ? convertDate(props.max, 'YYYY-MM-DDTHH:mm:ss') : null,
          min: props.min ? convertDate(props.min, 'YYYY-MM-DDTHH:mm:ss') : null,
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
