import React, { useEffect } from "react";
import { Grid, TextField, MenuItem } from "@material-ui/core";
import { StamdataContext } from "../StamdataContext";
import { getStationTypes } from "../../../api";

const StationTypeSelect = ({
  selectedStationType,
  setSelectedStationType,
  stationTypes,
  onChange,
}) => {
  const handleSelection = (event) => {
    console.log(event.target.value);
    setSelectedStationType(event.target.value);
    console.log(event.target);
    onChange(event);
  };
  console.log(stationTypes);
  let menuItems = stationTypes
    .filter((i) => i.properties.tstype_id !== 0)
    .map((item) => (
      <MenuItem
        value={item.properties.tstype_id}
        key={item.properties.tstype_id}
      >
        {item.properties.tstype_name}
      </MenuItem>
    ));

  return (
    <TextField
      autoFocus
      variant="outlined"
      select
      margin="dense"
      value={selectedStationType}
      onChange={handleSelection}
      label="Station type"
      fullWidth
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </TextField>
  );
};

export default function StationForm({
  mode,
  selectedStationType,
  setSelectedStationType,
}) {
  const [stationTypes, setStationTypes] = React.useState([]);
  useEffect(() => {
    if (stationTypes.length > 0) {
      console.log("station more than zero");
    } else {
      console.log("station are 0");
    }
    if (mode === "edit") return;
    getStationTypes().then((res) => res && setStationTypes(res.data.features));
  }, []);

  const [, , formData, , , , setStationValue] =
    React.useContext(StamdataContext);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Navn"
          value={formData.station.stationname}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="dense"
          onChange={(e) => setStationValue("ts_name", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {mode === "add" ? (
          <StationTypeSelect
            selectedStationType={selectedStationType}
            setSelectedStationType={setSelectedStationType}
            stationTypes={stationTypes}
            onChange={(e) => setStationValue("tstype_id", e.target.value)}
          />
        ) : (
          <TextField
            InputProps={{
              readOnly: true,
            }}
            variant="outlined"
            type="text"
            label="Station type"
            value={formData.station.tstype_name}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            margin="dense"
          />
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="number"
          label=" Målepunktskote"
          value={formData.station.maalepunktskote}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="dense"
          onChange={(e) => setStationValue("maalepunktskote", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="number"
          label="Evt. loggerdybde"
          value={formData.station.terrainlevel}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="dense"
          onChange={(e) => setStationValue("sensor_depth_m", e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
