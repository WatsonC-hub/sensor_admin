import React from 'react';
import StamdataWatlevmp from '../StamdataWatlevmp';
import {Grid2} from '@mui/material';
import {FormInputProps} from '~/components/FormInput';
import {Watlevmp} from '~/features/station/schema';
import useBreakpoints from '~/hooks/useBreakpoints';

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
      <Grid2 size={isMobile ? 12 : 4}>
        <StamdataWatlevmp.Elevation helperText={helperText} {...slotProps?.elevation} />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 8}>
        <StamdataWatlevmp.Description {...slotProps?.description} />
      </Grid2>
    </>
  );
};

export default DefaultWatlevmpForm;
