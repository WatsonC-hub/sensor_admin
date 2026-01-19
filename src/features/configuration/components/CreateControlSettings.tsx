import {Grid2} from '@mui/material';
import React from 'react';
import {FormInputProps} from '~/components/FormInput';
import ControlSettings, {
  ControlSettingsProps,
} from '~/features/configuration/components/ControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ControlSettingsFormValues} from '../api/useControlSettingsForm';

type Props = {
  slotProps?: {
    controlFrequency?: ControlSettingsProps;
    leadTime?: Omit<FormInputProps<ControlSettingsFormValues>, 'name'>;
  };
  containerGridSize?: number;
};

const CreateControlSettings = ({slotProps, containerGridSize = 12}: Props) => {
  const {isMobile} = useBreakpoints();
  return (
    <Grid2 container size={containerGridSize} spacing={1}>
      <Grid2 size={isMobile ? 12 : 6}>
        <ControlSettings.ControlFrequency disabled={false} {...slotProps?.controlFrequency} />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 6}>
        <ControlSettings.LeadTime {...slotProps?.leadTime} />
      </Grid2>
    </Grid2>
  );
};

export default CreateControlSettings;
