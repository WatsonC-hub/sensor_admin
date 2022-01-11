import React from "react";
import { Grid, MenuItem, TextField } from "@material-ui/core";
import { StamdataContext } from "../StamdataContext";
import { InputAdornment } from "@material-ui/core";

export default function LocalityForm() {
  const [, , formData, , , setLocationValue, , ,] =
    React.useContext(StamdataContext);

  console.log("got formdata => ", formData);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.loc_name === "",
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          variant="outlined"
          type="text"
          label="Navn"
          value={formData.location.loc_name}
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
            readOnly: formData.location.loc_name === "",
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          variant="outlined"
          type="text"
          label="Hoved lokation"
          value={formData.location.mainloc}
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
            readOnly: formData.location.loc_name === "",
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          variant="outlined"
          type="number"
          label="X-koordinat (UTM)"
          value={formData.location.x}
          onChange={(event) => setLocationValue("x", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.loc_name === "",
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          variant="outlined"
          type="number"
          label="Y-koordinat (UTM)"
          value={formData.location.y}
          onChange={(event) => setLocationValue("y", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.loc_name === "",
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          variant="outlined"
          type="number"
          label="Terrænkote"
          value={formData.location.terrainlevel}
          onChange={(event) =>
            setLocationValue("terrainlevel", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin="dense"
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.loc_name === "",
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          autoFocus
          variant="outlined"
          select
          margin="dense"
          label="Type af terrænkote"
          value={formData.location.terrainqual}
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
        <TextField
          InputProps={{
            readOnly: formData.location.loc_name === "",
          }}
          disabled={formData.location.loc_name === "" ? true : false}
          variant="outlined"
          type="text"
          label="Kommentar"
          value={formData.location.description}
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
