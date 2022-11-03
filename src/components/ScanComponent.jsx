import React, { useEffect, useState } from "react";
import { useParams, Navigate } from "react-router-dom";
import { getLocidFromLabel, apiClient } from "src/pages/field/fieldAPI";
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
    return <Navigate to="/" />;
  }

  if (data?.length === 1) {
    return <Navigate to={`/location/${data[0].loc_id}/${data[0].ts_id}`} />;
  }

  return <Navigate to={`/location/${data?.[0].loc_id}`} />;
}
