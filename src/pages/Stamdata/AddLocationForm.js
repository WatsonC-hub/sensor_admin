import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { Grid, InputAdornment } from "@material-ui/core";
import { StamdataContext } from "./StamdataContext";
import { MenuItem } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import LocationTypeSelect from "./components/LocationTypeSelect";
import { getDTMQuota } from "../../api";

export default function AddLocationForm({
  locationDialogOpen,
  setLocationDialogOpen,
}) {
  const [locationData, setLocationData] = useState({
    loc_name: "",
    x: "",
    y: "",
    terrainlevel: "",
    terrainqual: "",
    mainloc: "",
    subloc: "",
    subsubloc: "",
    description: "",
    loctype_id: -1,
  });

  // TODO: Gør location type til at være et state så man kan se det ændres.

  const [, , , , , setLocationValue, , , , saveLocationFormData] =
    React.useContext(StamdataContext);

  const handleChange = (event) => {
    //console.log(event.target);
    console.log(locationData);
    setLocationData({
      ...locationData,
      [event.target.id]: event.target.value,
    });
    console.log(locationData);
  };

  const handleSelector = (event) => {
    setLocationData({
      ...locationData,
      terrainqual: event.target.value,
    });
  };

  const handleLoctype = (event) => {
    setLocationData({
      ...locationData,
      loctype_id: event.target.value,
    });
  };

  const handleSave = () => {
    // TODO: validate data.
    saveLocationFormData(locationData);
    setLocationDialogOpen(false);
    // We'are adding new location, so locid is empty.
    // locid used to determine whether we're updating or inserting
    // new location.
    setLocationValue("locid", "");
  };

  const handleClose = () => {
    setLocationDialogOpen(false);
  };

  const handleDTM = () => {
    getDTMQuota(locationData.x, locationData.y).then((res) => {
      var data = res.data.HentKoterRespons.data;
      if (data[0].kote !== null) {
        setLocationData({
          ...locationData,
          terrainlevel: data[0].kote.toFixed(3),
          terrainqual: "DTM",
        });
      }
    });
  };

  return (
    <Dialog
      open={locationDialogOpen}
      onClose={handleClose}
      aria-labelledby="form-dialog-title"
    >
      <DialogTitle id="form-dialog-title">Tilføj ny lokation</DialogTitle>
      <DialogContent>
        <Grid container spacing={0}>
          <Grid item xs={12} sm={12}>
            <TextField
              autoFocus
              margin="dense"
              id="loc_name"
              label="Navn"
              value={locationData.loc_name}
              onChange={handleChange}
              type="text"
              fullWidth
              placeholder="f.eks. Brabrand_1"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              autoFocus
              margin="dense"
              id="mainloc"
              label="Hoved lokation"
              value={locationData.mainloc}
              onChange={handleChange}
              type="text"
              fullWidth
              placeholder="f.eks. Aarhus Kommune"
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              autoFocus
              margin="dense"
              id="x"
              label="X-koordinat(UTM)"
              value={locationData.x}
              onChange={handleChange}
              type="number"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              autoFocus
              margin="dense"
              id="y"
              label="Y-koordinat (UTM)"
              value={locationData.y}
              onChange={handleChange}
              type="number"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={12} sm={3}>
            <TextField
              autoFocus
              margin="dense"
              id="terrainlevel"
              label="Terrænkote"
              value={locationData.terrainlevel}
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">m</InputAdornment>
                ),
              }}
              onChange={handleChange}
              type="number"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
            />
          </Grid>
          <Grid item xs={7} sm={4}>
            <TextField
              autoFocus
              margin="dense"
              id="terrainqual"
              label="Type af terrænkote"
              value={locationData.terrainqual}
              onChange={handleSelector}
              select
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              placeholder="Vælg type"
            >
              <MenuItem value="dGPS">dGPS</MenuItem>
              <MenuItem value="DTM">DTM</MenuItem>
            </TextField>
          </Grid>
          <Grid item xs={5} sm={3} style={{ alignSelf: "center" }}>
            <Button
              onClick={handleDTM}
              color="secondary"
              variant="contained"
              size="small"
              style={{
                textTransform: "none",
                marginLeft: "12px",
              }}
            >
              Hent fra DTM
            </Button>
          </Grid>
          <Grid item xs={12} sm={12}>
          <LocationTypeSelect
            selectedLocationType={locationData.loctype_id}
            onChange={handleLoctype}
          />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              autoFocus
              margin="dense"
              id="description"
              label="Kommentar"
              value={locationData.description}
              onChange={handleChange}
              type="text"
              fullWidth
              variant="outlined"
              InputLabelProps={{ shrink: true }}
              placeholder="f.eks. ligger tæt ved broen"
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={handleSave} color="secondary" variant="contained">
          Tilføj
        </Button>
        <Button onClick={handleClose} color="secondary" variant="contained">
          Annuller
        </Button>
      </DialogActions>
    </Dialog>
  );
}
