import React, { useEffect, useState } from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import { InputAdornment } from "@mui/material";
import { getLocationTypes } from "../../fieldAPI";
import LocationTypeSelect from "./LocationTypeSelect";
import { stamdataStore } from "../../../../state/store";

export default function LocationForm({ mode }) {
  const [location, setLocationValue] = stamdataStore((store) => [
    store.location,
    store.setLocationValue,
  ]);

  // console.log("got formdata => ", formData);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
          }}
          disabled={location.loc_name === "" ? true : false}
          variant="outlined"
          type="text"
          label="Navn"
          value={location.loc_name}
          onChange={(event) => {
            setLocationValue("loc_name", event.target.value);
          }}
          InputLabelProps={{ shrink: true }}
          fullWidth
          placeholder="f.eks. Brabrand_1"
          margin="dense"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
          }}
          disabled={location.loc_name === "" ? true : false}
          variant="outlined"
          type="text"
          label="Hoved lokation"
          value={location.mainloc}
          onChange={(event) => setLocationValue("mainloc", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          placeholder="f.eks. Aarhus Kommune"
          margin="dense"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
          }}
          disabled={location.loc_name === "" ? true : false}
          variant="outlined"
          type="number"
          label="X-koordinat (UTM)"
          value={location.x}
          onChange={(event) => setLocationValue("x", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
          }}
          disabled={location.loc_name === "" ? true : false}
          variant="outlined"
          type="number"
          label="Y-koordinat (UTM)"
          value={location.y}
          onChange={(event) => setLocationValue("y", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
        />
      </Grid>
      <Grid item xs={6} sm={6} md={3}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
          disabled={location.loc_name === "" ? true : false}
          variant="outlined"
          type="number"
          label="Terrænkote"
          value={location.terrainlevel}
          onChange={(event) =>
            setLocationValue("terrainlevel", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
        />
      </Grid>

      <Grid item xs={6} sm={6} md={3}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
          }}
          disabled={location.loc_name === "" ? true : false}
          autoFocus
          variant="outlined"
          select
          margin="dense"
          label="Type af terrænkote"
          value={location.terrainqual}
          onChange={(event) =>
            setLocationValue("terrainqual", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
        >
          <MenuItem value={-1}> Vælg type </MenuItem>
          <MenuItem value="dGPS">dGPS</MenuItem>
          <MenuItem value="DTM">DTM</MenuItem>
        </TextField>
      </Grid>
      <Grid item xs={12} sm={6}>
        <LocationTypeSelect
          selectedLocationType={location.loctype_id}
          onChange={(e) => setLocationValue("loctype_id", e.target.value)}
          disabled={location.loc_name === "" ? true : false}
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: location.loc_name === "",
          }}
          disabled={location.loc_name === "" ? true : false}
          variant="outlined"
          type="text"
          label="Kommentar"
          value={location.description}
          onChange={(event) =>
            setLocationValue("description", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
          placeholder="f.eks. ligger tæt ved broen"
        />
      </Grid>
    </Grid>
  );
}
