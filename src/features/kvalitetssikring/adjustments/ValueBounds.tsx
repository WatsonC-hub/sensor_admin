import {Box, Typography} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import YRangeModal from '~/pages/admin/kvalitetssikring/modals/YRangeModal';

interface WizardValueBoundsProps {
  onClose: () => void;
}

const ValueBounds = ({onClose}: WizardValueBoundsProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <Box
      sx={{
        alignSelf: 'center',
        width: 'inherit',
        height: 'inherit',
        justifySelf: 'center',
      }}
    >
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        component="h2"
        sx={{
          alignSelf: 'center',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Øvre og nedre værdigrænser
      </Typography>
      <Box
        sx={{
          alignSelf: 'center',
        }}
      >
        <YRangeModal onClose={onClose} />
      </Box>
    </Box>
  );
};

export default ValueBounds;
