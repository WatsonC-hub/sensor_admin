import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { InputAdornment } from "@material-ui/core";
import { StamdataContext } from "./StamdataContext";
import { MenuItem } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";

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
  });

  const [, , , , , setLocationValue, , , , saveLocationFormData] =
    React.useContext(StamdataContext);

  const handleChange = (event) => {
    //console.log(event.target);
    setLocationData({
      ...locationData,
      [event.target.id]: event.target.value,
    });
  };

  const handleSelector = (event) => {
    setLocationData({
      ...locationData,
      terrainqual: event.target.value,
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

  return (
    <div>
      <Dialog
        open={locationDialogOpen}
        onClose={handleClose}
        aria-labelledby="form-dialog-title"
      >
        <DialogTitle id="form-dialog-title">Tilføj ny lokation</DialogTitle>
        <DialogContent>
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
          <TextField
            autoFocus
            margin="dense"
            id="terrainlevel"
            label="Terrænkote"
            value={locationData.terrainlevel}
            InputProps={{
              endAdornment: <InputAdornment position="start">m</InputAdornment>,
            }}
            onChange={handleChange}
            type="number"
            fullWidth
            variant="outlined"
            InputLabelProps={{ shrink: true }}
          />
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
    </div>
  );
}
