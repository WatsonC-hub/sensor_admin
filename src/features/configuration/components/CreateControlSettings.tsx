import {Grid2} from '@mui/material';
import React from 'react';
import ControlSettings, {
  ControlSettingsProps,
} from '~/features/configuration/components/ControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  slotProps?: {
    controlFrequency?: ControlSettingsProps;
  };
  containerGridSize?: number;
};

const CreateControlSettings = ({slotProps, containerGridSize = 12}: Props) => {
  const {isMobile} = useBreakpoints();
  return (
    <Grid2 container size={containerGridSize} spacing={1}>
      <Grid2 size={isMobile ? 12 : 6}>
        <ControlSettings.ControlFrequency
          required
          disabled={false}
          {...slotProps?.controlFrequency}
        />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 6}>
        <ControlSettings.LeadTime />
      </Grid2>
    </Grid2>
  );
};

export default CreateControlSettings;
