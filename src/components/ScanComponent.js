import React, { useContext, useEffect, useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { getLocidFromLabel } from "../api";

export default function ScanComponent() {
  const params = useParams();
  const [locationId, setLocationId] = useState(null);

  useEffect(() => {
    const label = parseInt(params.labelid);
    getLocidFromLabel(label).then((res) => {
      if (res.data.success) {
        console.log(res.data.features[0]);
        const loc = res.data.features[0].properties.locid;
        setLocationId(loc);
      }
    });
  }, []);

  if (!locationId) {
    return <p>loading...</p>;
  }

  return <Redirect to={`/location/${locationId}`} />;
}
