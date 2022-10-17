import React, { useEffect, useState } from "react";
import { Grid, MenuItem, TextField } from "@mui/material";
import { StamdataContext } from "../../../state/StamdataContext";
import { InputAdornment } from "@mui/material";
import { getLocationTypes } from "../../../api";
import { useQuery } from "@tanstack/react-query";

export default function LocationTypeSelect({
  selectedLocationType,
  onChange,
  disabled,
}) {
  const { data, isLoading } = useQuery(["location_types"], getLocationTypes, {
    select: (data) =>
      data
        .filter((i) => i.properties.loctype_id !== 0)
        .map((item) => (
          <MenuItem
            value={item.properties.loctype_id}
            key={item.properties.loctype_id}
          >
            {item.properties.loctypename}
          </MenuItem>
        )),
  });

  const handleSelection = (event) => {
    onChange(event);
  };

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
      {data}
    </TextField>
  );
}
