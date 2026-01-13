import {Grid2} from '@mui/material';
import React from 'react';
import {FormInputProps} from '~/components/FormInput';
import ControlSettings from '~/features/configuration/components/ControlSettings';
import useBreakpoints from '~/hooks/useBreakpoints';
import {ControlSettingsFormValues} from '../api/useControlSettingsForm';

type Props = {
  slotProps?: {
    controlFrequency?: Omit<FormInputProps<ControlSettingsFormValues>, 'name'>;
    leadTime?: Omit<FormInputProps<ControlSettingsFormValues>, 'name'>;
  };
};

const CreateControlSettings = ({slotProps}: Props) => {
  const {isMobile} = useBreakpoints();
  return (
    <>
      <Grid2 size={isMobile ? 12 : 3}>
        <ControlSettings.ControlFrequency {...slotProps?.controlFrequency} />
      </Grid2>
      <Grid2 size={isMobile ? 12 : 3}>
        <ControlSettings.LeadTime {...slotProps?.leadTime} />
      </Grid2>
    </>
  );
};

export default CreateControlSettings;
