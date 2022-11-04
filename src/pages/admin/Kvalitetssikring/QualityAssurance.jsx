import React from "react";
import { useParams } from "react-router-dom";
import BearingGraph from "src/pages/field/Station/BearingGraph";
const QualityAssurance = () => {
  let params = useParams();

  return (
    <BearingGraph
      stationId={params.ts_id}
      measurements={[]}
      dynamicMeasurement={[]}
    />
  );
};

export default QualityAssurance;
