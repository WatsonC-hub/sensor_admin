import React, { useEffect, useState } from "react";
import { Grid, MenuItem, TextField } from "@material-ui/core";
import { StamdataContext } from "../StamdataContext";
import { InputAdornment } from "@material-ui/core";
import { getLocationTypes } from "../../../api";

export default function LocationTypeSelect({
  selectedLocationType,
  onChange,
  disabled,
}) {
  const [locationTypes, setLocationTypes] = useState([]);

  useEffect(() => {
    getLocationTypes().then(
      (res) => res && setLocationTypes(res.data.features)
    );
  }, []);
  const handleSelection = (event) => {
    onChange(event);
  };
  console.log(locationTypes);
  let menuItems = locationTypes
    .filter((i) => i.properties.loctype_id !== 0)
    .map((item) => (
      <MenuItem
        value={item.properties.loctype_id}
        key={item.properties.loctype_id}
      >
        {item.properties.loctypename}
      </MenuItem>
    ));

  return (
    <TextField
      InputProps={{
        readOnly: disabled,
      }}
      disabled={disabled}
      variant="outlined"
      select
      margin="dense"
      value={selectedLocationType}
      onChange={handleSelection}
      label="Lokation type"
      fullWidth
    >
      <MenuItem value={-1}>Vælg type</MenuItem>
      {menuItems}
    </TextField>
  );
}
