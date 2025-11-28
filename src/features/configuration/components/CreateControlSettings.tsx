import {Grid2, Grid2Props} from '@mui/material';
import React from 'react';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';

const CreateControlSettings = () => {
  const {isMobile} = useBreakpoints();
  const size: Grid2Props['size'] = isMobile ? 12 : 3;
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <ControlSettings.ControlFrequency />
      </Grid2>
      <Grid2 size={size}>
        <ControlSettings.LeadTime />
      </Grid2>
    </Grid2>
  );
};

export default CreateControlSettings;
