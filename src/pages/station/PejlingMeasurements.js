import React from "react";
import HistoricMeasurements from "./HistoricMeasurements";
import MobileMeasurements from "./MobileMeasurements";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";

export default function PejlingMeasurements(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  return matches ? (
    <MobileMeasurements {...props} />
  ) : (
    <HistoricMeasurements {...props} />
  );
}
