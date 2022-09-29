import React, { useEffect } from "react";
import { Grid, TextField, MenuItem, CircularProgress } from "@material-ui/core";
import { StamdataContext } from "../../../state/StamdataContext";
import { getStationTypes } from "../../../api";
import { InputAdornment } from "@material-ui/core";
import stamdataStore from "../../../state/store";
import { useQuery } from "@tanstack/react-query";

const StationTypeSelect = ({
  selectedStationType,
  setSelectedStationType,
  stationTypes,
  onChange,
  isLoading,
}) => {
  const handleSelection = (event) => {
    setSelectedStationType(event.target.value);
    onChange(event);
  };

  if (isLoading) {
    return <CircularProgress />;
  }

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
  const [timeseries, setTimeseriesValue] = stamdataStore((store) => [
    store.timeseries,
    store.setTimeseriesValue,
  ]);
  // const [timeseties_types, setStationTypes] = React.useState([]);

  const { data: timeseries_types, isLoading } = useQuery(
    ["timeseries_types"],
    getStationTypes
  );
  // useEffect(() => {
  //   if (timeseties_types.length > 0) {
  //     console.log("station more than zero");
  //   } else {
  //     console.log("station are 0");
  //   }
  //   if (mode === "edit") return;
  //   getStationTypes().then((res) => res && setStationTypes(res.data.features));
  // }, []);

  const [, , formData, , , , setStationValue] =
    React.useContext(StamdataContext);

  console.log(
    timeseries_types?.filter(
      (elem) => elem.properties.tstype_id == timeseries.tstype_id
    )[0]?.properties?.tstype_name
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="text"
          label="Navn"
          value={timeseries.ts_name}
          InputLabelProps={{
            shrink: true,
          }}
          fullWidth
          margin="dense"
          placeholder="f.eks. Brabrand_1_vandstand"
          onChange={(e) => setTimeseriesValue("ts_name", e.target.value)}
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        {mode === "add" ? (
          <StationTypeSelect
            selectedStationType={selectedStationType}
            setSelectedStationType={setSelectedStationType}
            stationTypes={timeseries_types}
            isLoading={isLoading}
            onChange={(e) => setTimeseriesValue("tstype_id", e.target.value)}
          />
        ) : (
          <TextField
            InputProps={{
              style: { color: "black" },
            }}
            disabled={true}
            variant="outlined"
            type="text"
            label="Station type"
            value={
              timeseries_types?.filter(
                (elem) => elem.properties.tstype_id == timeseries.tstype_id
              )[0]?.properties?.tstype_name
            }
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            margin="dense"
          />
        )}
      </Grid>
      {mode === "add" && selectedStationType === 1 && (
        <Grid item xs={12} sm={6} md={2}>
          <TextField
            variant="outlined"
            type="number"
            label="Målepunktskote"
            value={timeseries.maalepunktskote}
            InputProps={{
              endAdornment: <InputAdornment position="start">m</InputAdornment>,
            }}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            margin="dense"
            onChange={(e) =>
              setTimeseriesValue("maalepunktskote", e.target.value)
            }
          />
        </Grid>
      )}
      {mode === "add" && selectedStationType === 1 && (
        <Grid item xs={12} sm={6} md={4}>
          <TextField
            variant="outlined"
            type="text"
            label="Målepunkt placering"
            value={timeseries.mp_description}
            InputLabelProps={{
              shrink: true,
            }}
            fullWidth
            placeholder="f.eks. top af rør"
            margin="dense"
            onChange={(e) =>
              setTimeseriesValue("mp_description", e.target.value)
            }
          />
        </Grid>
      )}
      <Grid item xs={12} sm={6}>
        <TextField
          variant="outlined"
          type="number"
          label="Evt. loggerdybde under målepunkt"
          value={timeseries.sensor_depth_m}
          InputLabelProps={{
            shrink: true,
          }}
          InputProps={{
            endAdornment: <InputAdornment position="start">m</InputAdornment>,
          }}
          fullWidth
          margin="dense"
          onChange={(e) => setTimeseriesValue("sensor_depth_m", e.target.value)}
        />
      </Grid>
    </Grid>
  );
}
