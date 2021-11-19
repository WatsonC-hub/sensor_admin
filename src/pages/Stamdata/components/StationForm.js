import React, { useEffect } from "react";
import { Grid, TextField, MenuItem } from "@material-ui/core";
import { StamdataContext } from "../StamdataContext";
import { getStationTypes } from "../../../api";

const StationTypeSelect = (props) => {
  const { selectedStationType, setSelectedStationType, stationTypes } = props;
  const handleSelection = (event) => {
    setSelectedStationType(event.target.value);
  };

  let menuItems = stationTypes
    .filter((i) => i.properties.tstype_id !== 0)
    .map((item) => (
      <MenuItem value={item.properties.tstype_id}>
        {item.properties.tstype_name}
      </MenuItem>
    ));
  return (
    <TextField
      autoFocus
      variant='outlined'
      select
      margin='dense'
      value={selectedStationType}
      onChange={handleSelection}
      label='Station type'
      fullWidth
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </TextField>
  );
};

export default function StationForm(props) {
  const [stationTypes, setStationTypes] = React.useState([]);
  const mode = props.mode;
  useEffect(() => {
    if (stationTypes.length > 0) {
      console.log("station more than zero");
    } else {
      console.log("station are 0");
    }
    if (mode === "add") return;
    getStationTypes().then((res) => res && setStationTypes(res.data.features));
  }, []);

  const [, , formData, , , , setStationValue, ,] =
    React.useContext(StamdataContext);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Navn'
          value={formData.station.stationname}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
          onChange={(e) => setStationValue("stationname", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {mode === "add" ? (
          <StationTypeSelect {...props} stationTypes={stationTypes} />
        ) : (
          <TextField
            InputProps={{
              readOnly: true,
            }}
            variant='outlined'
            type='text'
            label='Station type'
            value={formData.station.tstype_name}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
          />
        )}
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='number'
          label=' Målepunktskote'
          value={formData.station.maalepunktskote}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
          onChange={(e) => setStationValue("maalepunktskote", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Evt. loggerdybde'
          value={formData.station.terrainlevel}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
          onChange={(e) => setStationValue("terrainlevel", e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
