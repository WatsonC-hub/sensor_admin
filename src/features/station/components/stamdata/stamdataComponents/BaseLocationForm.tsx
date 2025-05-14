import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {useAppContext} from '~/state/contexts';

type Props = {
  size: number;
};

const BaseLocationForm = ({size}: Props) => {
  const {loc_id} = useAppContext([], ['loc_id']);
  const disabled = loc_id !== undefined;

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} />
      </Grid2>
    </Grid2>
  );
};

export default BaseLocationForm;
