import {Grid} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

import StamdataWatlevmp from '../MPFormCompound';

import type {FormInputProps} from '~/components/FormInput';
import type {Watlevmp} from '~/features/station/schema';

type DefaultWatlevmpFormProps = {
  helperText?: string;
  slotProps?: {
    elevation?: Omit<FormInputProps<Watlevmp>, 'name'>;
    description?: Omit<FormInputProps<Watlevmp>, 'name'>;
  };
};

const DefaultWatlevmpForm = ({helperText, slotProps}: DefaultWatlevmpFormProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <>
      <Grid size={isMobile ? 12 : 4}>
        <StamdataWatlevmp.Elevation helperText={helperText} {...slotProps?.elevation} />
      </Grid>
      <Grid size={isMobile ? 12 : 8}>
        <StamdataWatlevmp.Description {...slotProps?.description} />
      </Grid>
    </>
  );
};

export default DefaultWatlevmpForm;
