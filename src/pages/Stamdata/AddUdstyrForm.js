import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogContentText from "@material-ui/core/DialogContentText";
import DialogTitle from "@material-ui/core/DialogTitle";
import DateFnsUtils from "@date-io/date-fns";
import { isValid, format } from "date-fns";
import daLocale from "date-fns/locale/da";
import { getAvailableUnits } from "../../api";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
  DateTimePicker
} from "@material-ui/pickers";
import { MenuItem } from "@material-ui/core";
import { StamdataContext } from "./StamdataContext";

export default function AddUdstyrForm({
  ustyrDialogOpen,
  setUdstyrDialogOpen,
  /*saveUdstyrFormData,*/
  tstype_id,
}) {
  const [open, setOpen] = React.useState(false);
  const [chosenUnit, setChosenUnit] = useState(null);

  const [udstyrFormData, setUdstyrFormData] = useState({
    calypso_id: -1,
    sensor_id: -1,
    uuid: "",
    fra: new Date(),
  });

  const [, , , , , , , , saveUdstyrFormData] =
    React.useContext(StamdataContext);

  const [availableUnits, setAvailableUnits] = useState([]);

  const uniqueCalypsoIds = () => [
    ...new Set(availableUnits.map((x) => x.calypso_id)),
  ];

  const sensorsForCalyspoId = (id) =>
    availableUnits.filter(
      (unit) => unit.calypso_id === id && unit.sensortypeid === tstype_id
    );

  const handleCalypsoId = (event) => {
    setUdstyrFormData({
      ...udstyrFormData,
      calypso_id: event.target.value,
    });
  };

  const handleSensorId = (event) => {
    setUdstyrFormData({
      ...udstyrFormData,
      uuid: event.target.value,
    });
  };

  const handleDateChange = (date) => {
    console.log(date)
    setUdstyrFormData({
      ...udstyrFormData,
      fra: date,
    });
  };

  const handleSave = () => {
    // TODO 1 : use form data to find the right unit
    // and use context.setValues() to populate opretfrom - udstyr
    //saveUdstyrFormData(udstyrFormData);
    setUdstyrDialogOpen(false);
    let unit = availableUnits.find(
      (x) => x.unit_uuid === udstyrFormData.uuid
    );

    console.log(unit);

    if (!unit) return;
    
    saveUdstyrFormData({
      terminal: unit.type,
      terminal_id: unit.terminal_id,
      sensor_id: unit.sensor_id,
      sensorinfo: unit.sensorinfo,
      parameter: unit.sensorinfo,
      calypso_id: unit.calypso_id,
      batteriskift: unit.batteriskift,
      startdato: udstyrFormData.fra,
      slutdato: unit.slutdato,
      uuid: unit.unit_uuid
    });
  };

  const handleClickOpen = () => {
    setUdstyrDialogOpen(true);
  };

  const handleClose = () => {
    setUdstyrDialogOpen(false);
  };

  const [
    locality,
    setLocality,
    formData,
    setFormData,
    setValues,
    setLocationValue,
    setStationValue,
    setUdstyrValue,
  ] = React.useContext(StamdataContext);

  useEffect(() => {
    getAvailableUnits().then((res) => setAvailableUnits(res));
  }, []);

  return (
    <div>
      <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
        <Dialog
          open={ustyrDialogOpen}
          onClose={handleClose}
          aria-labelledby='form-dialog-title'
        >
          <DialogTitle id='form-dialog-title'>Tilføj Udstyr</DialogTitle>
          <DialogContent>
            <TextField
              autoFocus
              select
              margin='dense'
              value={udstyrFormData.calypso_id}
              onChange={handleCalypsoId}
              id='calypso_id'
              label='Calypso ID'
              fullWidth
            >
              <MenuItem key={-1} value={-1}>
                Vælg calypso ID
              </MenuItem>
              {uniqueCalypsoIds().map((option) => (
                <MenuItem key={option} value={option}>
                  {option}
                </MenuItem>
              ))}
            </TextField>
            <TextField
              autoFocus
              select
              margin='dense'
              value={udstyrFormData.sensor_id}
              onChange={handleSensorId}
              id='sensor_id'
              label='Sensor / Sensor ID'
              type='email'
              fullWidth
            >
              <MenuItem key={-1} value={-1}>
                Vælg Sensor ID
              </MenuItem>
              {sensorsForCalyspoId(udstyrFormData.calypso_id).map((option) => (
                <MenuItem key={option.unit_uuid} value={option.unit_uuid}>
                  {option.channel} - {option.sensortypename}
                </MenuItem>
              ))}
            </TextField>
            <DateTimePicker
              autoOk
              disableToolbar
              variant='inline'
              inputProps={{ readOnly: true }}
              format='yyyy-MM-dd HH:mm'
              margin='normal'
              id='Fra'
              label={
                <Typography variant='h6' component='h3'>
                  Fra
                </Typography>
              }
              InputLabelProps={{ shrink: true }}
              value={udstyrFormData.fra}
              onChange={(date) => handleDateChange(date)}
              KeyboardButtonProps={{
                "aria-label": "change date",
              }}
              fullWidth
            />
            {/* <TextField
            autoFocus
            margin='dense'
            id='fra'
            label='Fra'
            type='email'
            fullWidth
          /> */}
          </DialogContent>
          <DialogActions>
            <Button onClick={handleSave} color='primary'>
              Gem
            </Button>
            <Button onClick={handleClose} color='primary'>
              Annuller
            </Button>
          </DialogActions>
        </Dialog>
      </MuiPickersUtilsProvider>
    </div>
  );
}
