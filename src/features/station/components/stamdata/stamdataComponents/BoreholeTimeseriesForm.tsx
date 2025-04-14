import {Grid2} from '@mui/material';
import React from 'react';

type Props = {
  size: number;
  loctype_id: number | undefined;
};

const BoreholeTimeseriesForm = ({size, loctype_id}: Props) => {
  if (loctype_id !== 9) {
    return null;
  }
  return <Grid2 size={size}></Grid2>;
};

export default BoreholeTimeseriesForm;
