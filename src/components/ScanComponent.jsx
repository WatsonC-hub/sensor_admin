import React, { useEffect, useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { getLocidFromLabel } from "../api";
import { CircularProgress } from "@material-ui/core";

export default function ScanComponent() {
  const params = useParams();
  const [locationId, setLocationId] = useState(null);
  const [ts_id, setTs_id] = useState(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const label = parseInt(params.labelid);
    getLocidFromLabel(label).then((res) => {
      if (res.data.success) {
        const features = res.data.features;
        if (features[0]) {
          console.log(features);
          if (features.length === 1) {
            setTs_id(features[0].properties.ts_id);
          }
          const loc = features[0].properties.loc_id;
          setLocationId(loc);
          setEmpty(false);
        } else {
          setEmpty(true);
        }
      }
    });
  }, []);

  if (!locationId && !empty) {
    return <CircularProgress />;
  }

  if (empty) {
    return <Redirect to="/" />;
  }

  if (ts_id) {
    return <Redirect to={`/location/${locationId}/${ts_id}`} />;
  }

  return <Redirect to={`/location/${locationId}`} />;
}
