import React, { useEffect, useState } from "react";
import { useParams, Redirect } from "react-router-dom";
import { getLocidFromLabel } from "../api";

export default function ScanComponent() {
  const params = useParams();
  const [locationId, setLocationId] = useState(null);
  const [empty, setEmpty] = useState(false);

  useEffect(() => {
    const label = parseInt(params.labelid);
    getLocidFromLabel(label).then((res) => {
      if (res.data.success) {
        const features = res.data.features[0];
        if (features) {
          const loc = res.data.features[0].properties.locid;
          setLocationId(loc);
          setEmpty(false);
        } else {
          setEmpty(true);
        }
      }
    });
  }, []);

  if (!locationId && !empty) {
    return <p>loading...</p>;
  }

  if (empty) {
    return <Redirect to='/' />;
  }

  return <Redirect to={`/location/${locationId}`} />;
}
