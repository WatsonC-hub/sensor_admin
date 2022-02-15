import React from "react";
import { Grid, TextField } from "@material-ui/core";
import "date-fns";
import { StamdataContext } from "../StamdataContext";
import moment from "moment";
import OwnDatePicker from "../../../components/OwnDatePicker";

export default function UdstyrForm(props) {
  const editMode = props.mode === "edit";
  const [, , formData, , , , , setUdstyrValue] =
    React.useContext(StamdataContext);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            style: { color: "black" },
          }}
          disabled={true}
          variant="outlined"
          type="text"
          id="terminal"
          value={formData.udstyr.terminal_type}
          label="Terminal"
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
          onChange={(e) => setUdstyrValue("terminal_type", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            style: { color: "black" },
          }}
          disabled={true}
          variant="outlined"
          type="text"
          label="Terminal ID"
          value={formData.udstyr.terminal_id}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
          onChange={(e) => setUdstyrValue("terminal_id", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            style: { color: "black" },
          }}
          disabled={true}
          focused={false}
          variant="outlined"
          type="text"
          label="CALYPSO ID"
          value={formData.udstyr.calypso_id}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
          onChange={(e) => setUdstyrValue("calypso_id", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            style: { color: "black" },
          }}
          disabled={true}
          variant="outlined"
          type="text"
          label="Sensor"
          value={formData.udstyr.sensorinfo}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
          onChange={(e) => setUdstyrValue("sensorinfo", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            style: { color: "black" },
          }}
          disabled={true}
          variant="outlined"
          type="text"
          label="Sensor ID"
          value={formData.udstyr.sensor_id}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
          onChange={(e) => setUdstyrValue("sensor_id", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {!editMode ? (
          <TextField
            InputProps={{
              style: { color: "black" },
            }}
            disabled={true}
            variant="outlined"
            type="text"
            label="Startdato"
            value={
              formData.udstyr.startdato
                ? moment(formData.udstyr.startdato).format("YYYY-MM-DD HH:mm")
                : ""
            }
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="dense"
          />
        ) : (
          <OwnDatePicker
            label="Startdato"
            value={formData.udstyr.startdato}
            onChange={(date) =>
              setUdstyrValue(
                "startdato",
                moment(date).format("YYYY-MM-DD HH:mm")
              )
            }
          />
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        {editMode && (
          <OwnDatePicker
            label="Slutdato"
            value={formData.udstyr.slutdato}
            onChange={(date) =>
              setUdstyrValue(
                "slutdato",
                moment(date).format("YYYY-MM-DD HH:mm")
              )
            }
          />
        )}
      </Grid>
    </Grid>
  );
}
