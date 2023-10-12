import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import React from 'react';
import HistoricMeasurements from './HistoricMeasurements';
import MobileMeasurements from './MobileMeasurements';

export default function PejlingMeasurements(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? <MobileMeasurements {...props} /> : <HistoricMeasurements {...props} />;
}
