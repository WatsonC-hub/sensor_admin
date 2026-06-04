import {Grid2} from '@mui/material';
import React from 'react';
import ControlSettings from './ControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';

type EditControlSettingsProps = {
  disabled: boolean;
};

const EditControlSettings = ({disabled}: EditControlSettingsProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <Grid2 container size={12} spacing={2}>
      <Grid2 size={isMobile ? 12 : 6}>
        <ControlSettings.ControlFrequency disabled={disabled} />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 6}>
        <ControlSettings.LeadTime disabled={disabled} />
      </Grid2>
    </Grid2>
  );
};

export default EditControlSettings;
