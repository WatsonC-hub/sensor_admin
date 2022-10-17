import React, { useEffect, useState } from "react";
import Button from "@mui/material/Button";
import TextField from "@mui/material/TextField";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";

import { getAvailableUnits } from "../../api";

import { CircularProgress, MenuItem, useTheme } from "@mui/material";
import { StamdataContext } from "../../state/StamdataContext";
import OwnDatePicker from "../../components/OwnDatePicker";
import { Typography } from "@mui/material";
import { stamdataStore, initialState } from "../../state/store";
import { useQuery } from "@tanstack/react-query";

export default function AddUdstyrForm({
  udstyrDialogOpen,
  setUdstyrDialogOpen,
  tstype_id,
}) {
  const setUnit = stamdataStore((store) => store.setUnit);

  const { data: availableUnits, isLoading } = useQuery(
    ["available_units"],
    getAvailableUnits
  );

  const [unitData, setUnitData] = useState({
    calypso_id: -1,
    sensor_id: "",
    uuid: "",
    fra: new Date(),
  });

  const uniqueCalypsoIds = [
    ...new Set(
      availableUnits
        ?.filter((unit) => unit.sensortypeid === tstype_id)
        ?.map((x) => (x.calypso_id == 0 ? x.terminal_id : x.calypso_id))
    ),
  ].sort((a, b) => {
    if (typeof a == "number" && typeof b == "number") {
      return a - b;
    } else if (typeof a == "string" && typeof b == "string") {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
    } else if (typeof a == "string") {
      return 1;
    } else {
      return -1;
    }
  });

  const sensorsForCalyspoId = (id) =>
    availableUnits?.filter(
      (unit) => unit.calypso_id === id && unit.sensortypeid === tstype_id
    );

  const handleCalypsoId = (event) => {
    setUnitData({
      ...unitData,
      calypso_id: event.target.value,
      uuid: "",
    });
  };

  const handleSensorUUID = (event) => {
    setUnitData({
      ...unitData,
      uuid: event.target.value,
    });
  };

  const handleDateChange = (date) => {
    console.log(date);
    setUnitData({
      ...unitData,
      fra: date,
    });
  };

  const handleSave = () => {
    setUdstyrDialogOpen(false);
    let unit = availableUnits.find((x) => x.unit_uuid === unitData.uuid);

    if (!unit) return;

    setUnit({
      terminal_type: unit.type,
      terminal_id: unit.terminal_id,
      sensor_id: unit.sensor_id,
      sensorinfo: unit.sensorinfo,
      parameter: unit.sensorinfo,
      calypso_id: unit.calypso_id,
      batteriskift: unit.batteriskift,
      startdato: unitData.fra,
      slutdato: "2099-01-01 12:00:00",
      uuid: unit.unit_uuid,
    });
  };

  const handleClose = () => {
    setUdstyrDialogOpen(false);
  };

  return (
    <div>
      <Dialog
        open={udstyrDialogOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        {isLoading ? (
          <CircularProgress />
        ) : (
          <>
            <DialogTitle id="form-dialog-title">Tilføj Udstyr</DialogTitle>
            <DialogContent>
              {uniqueCalypsoIds.length === 0 && (
                <Typography variant="subtitle2" component="h3" color="error">
                  * ingen enheder der passer til stationstypen er tilgængelig
                </Typography>
              )}
              <TextField
                autoFocus
                select
                margin="dense"
                value={unitData.calypso_id}
                onChange={handleCalypsoId}
                id="calypso_id"
                label="Calypso ID"
                fullWidth
              >
                <MenuItem key={-1} value={-1}>
                  Vælg calypso ID
                </MenuItem>
                {uniqueCalypsoIds.map((option) => (
                  <MenuItem key={option} value={option}>
                    {option}
                  </MenuItem>
                ))}
              </TextField>
              <TextField
                select
                margin="dense"
                value={unitData.uuid}
                onChange={handleSensorUUID}
                id="sensor_id"
                label="Sensor / Sensor ID"
                fullWidth
              >
                <MenuItem key={-1} value={""}>
                  Vælg Sensor ID
                </MenuItem>
                {sensorsForCalyspoId(unitData.calypso_id).map((option) => (
                  <MenuItem key={option.unit_uuid} value={option.unit_uuid}>
                    {option.channel} - {option.sensortypename}
                  </MenuItem>
                ))}
              </TextField>
              <OwnDatePicker
                label={"Fra"}
                value={unitData.fra}
                onChange={(date) => handleDateChange(date)}
              />
            </DialogContent>
            <DialogActions>
              <Button
                onClick={handleSave}
                color="secondary"
                variant="contained"
                disabled={unitData.calypso_id === -1 || unitData.uuid === ""}
              >
                Tilføj
              </Button>
              <Button
                onClick={handleClose}
                color="secondary"
                variant="contained"
              >
                Annuller
              </Button>
            </DialogActions>
          </>
        )}
      </Dialog>
    </div>
  );
}
