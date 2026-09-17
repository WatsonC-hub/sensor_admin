import {Grid} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';

import ControlSettings from './ControlSettings';

type EditControlSettingsProps = {
  disabled: boolean;
};

const EditControlSettings = ({disabled}: EditControlSettingsProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <Grid container size={12} spacing={2}>
      <Grid size={isMobile ? 12 : 6}>
        <ControlSettings.ControlFrequency disabled={disabled} />
      </Grid>
      <Grid size={isMobile ? 12 : 6}>
        <ControlSettings.LeadTime disabled={disabled} />
      </Grid>
    </Grid>
  );
};

export default EditControlSettings;
