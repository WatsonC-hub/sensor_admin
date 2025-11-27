import {Grid2} from '@mui/material';
import React from 'react';
import StamdataLocation from '../StamdataLocation';
import {useAppContext} from '~/state/contexts';
import {BaseLocation} from '~/features/station/schema';
import {FormInputProps} from '~/components/FormInput';

type Props = {
  size: number;
  slotProps?: {
    loctypeSelect?: Omit<FormInputProps<BaseLocation>, 'name'>;
  };
};

const BaseLocationForm = ({size, slotProps}: Props) => {
  const {loc_id} = useAppContext([], ['loc_id']);
  const disabled = loc_id !== undefined;

  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} {...slotProps?.loctypeSelect} />
      </Grid2>
    </Grid2>
  );
};

export default BaseLocationForm;
