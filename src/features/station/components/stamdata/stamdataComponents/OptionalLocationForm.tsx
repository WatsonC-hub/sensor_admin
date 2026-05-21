import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {useFormContext} from 'react-hook-form';

type Props = {
  size: number;
  loc_id: number | undefined; // Optional prop for location ID
};

const OptionalLocationForm = ({size, loc_id}: Props) => {
  const {watch} = useFormContext();
  const disabled = loc_id !== undefined;
  const loctype_id = watch('loctype_id');
  return (
    <Grid2 container spacing={2}>
      {loctype_id === 9 && (
        <Grid2 size={size}>
          <StamdataLocation.BoreholeSuffix disabled={disabled} />
        </Grid2>
      )}
      <Grid2 size={size}>
        <StamdataLocation.Groups disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataLocation.Description disabled={disabled} />
      </Grid2>
    </Grid2>
  );
};

export default OptionalLocationForm;
