import {Grid2} from '@mui/material';
import React from 'react';
import ControlSettings from './ControlSettings';

const EditControlSettings = () => {
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={6}>
        <ControlSettings.ControlFrequency />
      </Grid2>
      <Grid2 size={6}>
        <ControlSettings.LeadTime />
      </Grid2>
    </Grid2>
  );
};

export default EditControlSettings;
