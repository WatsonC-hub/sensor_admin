import React from 'react';
import {MobileDateTimePicker, LocalizationProvider} from '@mui/x-date-pickers';
import {AdapterDateFns} from '@mui/x-date-pickers/AdapterDateFns';
import daLocale from 'date-fns/locale/da';
import {TextField} from '@mui/material';
import moment from 'moment/moment';

const OwnDatePicker = (props) => {
  return (
    <LocalizationProvider dateAdapter={AdapterDateFns} adapterLocale={daLocale}>
      {/* <MobileDateTimePicker
        disabled={props.disabled}
        disableToolbar
        ampm={false}
        showTodayButton={true}
        inputVariant="outlined"
        format="yyyy-MM-dd HH:mm"
        margin="dense"
        id={props.label}
        label={props.label}
        cancelLabel="Anuller"
        todayLabel="I dag"
        invalidDateMessage="Ugyldig dato"
        invalidLabel="Ukendt"
        InputLabelProps={{shrink: true}}
        value={props.value}
        onChange={props.onChange}
        KeyboardButtonProps={{
          'aria-label': 'change date',
        }}
        renderInput={(params) => (
          <TextField
            sx={props.error ? {} : props.sx}
            {...params}
            error={props.error}
            helperText={props.helperText}
          />
        )}
        fullWidth
      /> */}
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
        margin="dense"
      />
    </LocalizationProvider>
  );
};

export default OwnDatePicker;
