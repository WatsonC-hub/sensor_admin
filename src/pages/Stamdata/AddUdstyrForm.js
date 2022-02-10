import React, { useEffect, useState } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";

import { getAvailableUnits } from "../../api";

import { MenuItem, useTheme } from "@material-ui/core";
import { StamdataContext } from "./StamdataContext";
import OwnDatePicker from "../../components/OwnDatePicker";
import { Typography } from "@material-ui/core";

export default function AddUdstyrForm({
  udstyrDialogOpen,
  setUdstyrDialogOpen,
  tstype_id,
  setSelectedUnit,
}) {
  const [udstyrFormData, setUdstyrFormData] = useState({
    calypso_id: -1,
    sensor_id: -1,
    uuid: "",
    fra: new Date(),
  });

  const theme = useTheme();

  const [, , , , , , , , saveUdstyrFormData] =
    React.useContext(StamdataContext);

  const [availableUnits, setAvailableUnits] = useState([]);

  const uniqueCalypsoIds = () => [
    ...new Set(
      availableUnits
        .filter((unit) => unit.sensortypeid === tstype_id)
        .map((x) => x.calypso_id)
    ),
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

  const handleSensorUUID = (event) => {
    setUdstyrFormData({
      ...udstyrFormData,
      uuid: event.target.value,
    });
  };

  const handleDateChange = (date) => {
    console.log(date);
    setUdstyrFormData({
      ...udstyrFormData,
      fra: date,
    });
  };

  const handleSave = () => {
    setUdstyrDialogOpen(false);
    if (setSelectedUnit) {
      setSelectedUnit(-1);
    }
    let unit = availableUnits.find((x) => x.unit_uuid === udstyrFormData.uuid);

    if (!unit) return;

    saveUdstyrFormData({
      terminal_type: unit.type,
      terminal_id: unit.terminal_id,
      sensor_id: unit.sensor_id,
      sensorinfo: unit.sensorinfo,
      parameter: unit.sensorinfo,
      calypso_id: unit.calypso_id,
      batteriskift: unit.batteriskift,
      startdato: udstyrFormData.fra,
      slutdato: "2099-01-01 12:00:00",
      uuid: unit.unit_uuid,
    });
  };

  const handleClose = () => {
    setUdstyrDialogOpen(false);
  };

  useEffect(() => {
    getAvailableUnits(sessionStorage.getItem("session_id")).then((res) => {
      if (typeof res === "undefined") {
        setAvailableUnits([]);
      } else {
        setAvailableUnits(res.data.result);
      }
    });
  }, []);

  return (
    <div>
      <Dialog
        open={udstyrDialogOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Tilføj Udstyr</DialogTitle>
        <DialogContent>
          {uniqueCalypsoIds().length === 0 && (
            <Typography variant="subtitle2" component="h3" color="error">
              * ingen enheder der passer til stationstypen er tilgængelig
            </Typography>
          )}
          <TextField
            autoFocus
            select
            margin="dense"
            value={udstyrFormData.calypso_id}
            onChange={handleCalypsoId}
            id="calypso_id"
            label="Calypso ID"
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
            margin="dense"
            value={udstyrFormData.uuid}
            onChange={handleSensorUUID}
            id="sensor_id"
            label="Sensor / Sensor ID"
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
          <OwnDatePicker
            label={"Fra"}
            value={udstyrFormData.fra}
            onChange={(date) => handleDateChange(date)}
          />
        </DialogContent>
        <DialogActions>
          <Button
            onClick={handleSave}
            color="secondary"
            variant="contained"
            disabled={
              udstyrFormData.calypso_id === -1 || udstyrFormData.uuid === -1
            }
          >
            Tilføj
          </Button>
          <Button onClick={handleClose} color="secondary" variant="contained">
            Annuller
          </Button>
        </DialogActions>
      </Dialog>
    </div>
  );
}
