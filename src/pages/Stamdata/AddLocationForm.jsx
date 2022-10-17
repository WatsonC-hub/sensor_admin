import React, { useState, useEffect } from "react";
import Button from "@material-ui/core/Button";
import TextField from "@material-ui/core/TextField";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import { CircularProgress, Grid, InputAdornment } from "@material-ui/core";
import { StamdataContext } from "../../state/StamdataContext";
import { MenuItem } from "@material-ui/core";
import SaveIcon from "@material-ui/icons/Save";
import LocationTypeSelect from "./components/LocationTypeSelect";
import { getDTMQuota } from "../../api";
import { stamdataStore, initialState } from "../../state/store";
import { useQuery } from "@tanstack/react-query";

export default function AddLocationForm({
  locationDialogOpen,
  setLocationDialogOpen,
}) {
  const setLocation = stamdataStore((store) => store.setLocation);

  const [locationData, setLocationData] = useState(initialState.location);

  const handleChange = (event) => {
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

  const handleLoctype = (event) => {
    setLocationData({
      ...locationData,
      loctype_id: event.target.value,
    });
  };

  const handleSave = () => {
    setLocation(locationData);
    setLocationDialogOpen(false);
  };

  const handleClose = () => {
    setLocationDialogOpen(false);
  };

  const {
    data: DTMData,
    isFetching,
    refetch: refetchDTM,
  } = useQuery(["dtm"], () => getDTMQuota(locationData.x, locationData.y), {
    refetchOnWindowFocus: false,
    enabled: false,
  });

  useEffect(() => {
    console.log(DTMData);
    if (DTMData) {
      var data = DTMData.HentKoterRespons.data;
      if (data[0].kote !== null) {
        setLocationData({
          ...locationData,
          terrainlevel: data[0].kote.toFixed(3),
          terrainqual: "DTM",
        });
      }
    }
  }, [DTMData]);

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
              margin="dense"
              id="terrainlevel"
              label="Terrænkote"
              value={locationData.terrainlevel}
              InputProps={{
                endAdornment: isFetching ? (
                  <CircularProgress />
                ) : (
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
          <Grid
            item
            xs={5}
            sm={3}
            style={{
              alignSelf: "center",
              display: "flex",
            }}
          >
            <Button
              onClick={refetchDTM}
              color="secondary"
              variant="contained"
              size="small"
              style={{
                textTransform: "none",
                marginLeft: "12px",
              }}
              disabled={isFetching}
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
