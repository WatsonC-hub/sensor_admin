import {Grid} from '@mui/material';
import React from 'react';

import {useAppContext} from '~/state/contexts';

import StamdataLocation from '../StamdataLocation';

import type {FormInputProps} from '~/components/FormInput';
import type {BaseLocation} from '~/features/station/schema';

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
    <Grid container spacing={2}>
      <Grid size={size}>
        <StamdataLocation.LoctypeSelect disabled={disabled} {...slotProps?.loctypeSelect} />
      </Grid>
    </Grid>
  );
};

export default BaseLocationForm;
