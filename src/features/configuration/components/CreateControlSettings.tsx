import {Grid} from '@mui/material';
import React from 'react';
import ControlSettings, {
  ControlSettingsProps,
  LeadTimeProps,
} from '~/features/configuration/components/ControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  slotProps?: {
    controlFrequency?: ControlSettingsProps;
    leadTime?: LeadTimeProps;
  };
  containerGridSize?: number;
};

const CreateControlSettings = ({slotProps, containerGridSize = 12}: Props) => {
  const {isMobile} = useBreakpoints();
  return (
    <Grid container size={containerGridSize} spacing={1}>
      <Grid size={isMobile ? 12 : 6}>
        <ControlSettings.ControlFrequency required {...slotProps?.controlFrequency} />
      </Grid>
      <Grid size={isMobile ? 12 : 6}>
        <ControlSettings.LeadTime {...slotProps?.leadTime} />
      </Grid>
    </Grid>
  );
};

export default CreateControlSettings;
