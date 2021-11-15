import React from "react";
import { Grid, TextField } from "@material-ui/core";
import { StamdataContext } from "../StamdataContext";

export default function LocalityForm() {
  const [, , formData, , , setLocationValue, , ,] =
    React.useContext(StamdataContext);

  console.log("got formdata => ", formData);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='text'
          label='Navn'
          value={formData.location.locname}
          onChange={(event) => setLocationValue("locname", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='text'
          label='Hoved lokation'
          value={formData.location.mainloc}
          onChange={(event) => setLocationValue("mainloc", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='text'
          label='Under lokation'
          value={formData.location.subloc}
          onChange={(event) => setLocationValue("subloc", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='text'
          label='Under-under lokation'
          value={formData.location.subsubloc}
          onChange={(event) =>
            setLocationValue("subsubloc", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='number'
          label='X-koordinat (UTM)'
          value={formData.location.x}
          onChange={(event) => setLocationValue("x", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='number'
          label='Y-koordinat (UTM)'
          value={formData.location.y}
          onChange={(event) => setLocationValue("y", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='number'
          label='Terrænkote'
          value={formData.location.terrainlevel}
          onChange={(event) =>
            setLocationValue("terrainlevel", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='text'
          label='Type af terrænkote'
          value={formData.location.terrainqual}
          onChange={(event) =>
            setLocationValue("terrainqual", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          InputProps={{
            readOnly: formData.location.locname === "",
          }}
          variant='outlined'
          type='text'
          label='Kommentar'
          value={formData.location.description}
          onChange={(event) =>
            setLocationValue("description", event.target.value)
          }
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
    </Grid>
  );
}
