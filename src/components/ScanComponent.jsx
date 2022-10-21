import React, { useEffect, useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { getLocidFromLabel, apiClient } from "../api";
import { CircularProgress } from "@mui/material";
import { useQuery } from "@tanstack/react-query";

export default function ScanComponent() {
  const params = useParams();

  const { data, isLoading } = useQuery(
    ["labelid", params.labelid],
    async () => {
      const { data } = await apiClient.get(
        `/sensor_field/stamdata/calypso_id/${params.labelid}`
      );
      return data;
    }
  );

  if (isLoading) {
    return <CircularProgress />;
  }

  if (data?.length === 0) {
    return <Redirect to="/" />;
  }

  if (data?.length === 1) {
    return <Redirect to={`/location/${data[0].loc_id}/${data[0].ts_id}`} />;
  }

  return <Redirect to={`/location/${data[0].loc_id}`} />;
}
