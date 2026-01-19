import {Grid2} from '@mui/material';
import React from 'react';
import ControlSettings from './ControlSettings';

type EditControlSettingsProps = {
  disabled: boolean;
};

const EditControlSettings = ({disabled}: EditControlSettingsProps) => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={6}>
        <ControlSettings.ControlFrequency disabled={disabled} />
      </Grid2>
      <Grid2 size={6}>
        <ControlSettings.LeadTime disabled={disabled} />
      </Grid2>
    </Grid2>
  );
};

export default EditControlSettings;
