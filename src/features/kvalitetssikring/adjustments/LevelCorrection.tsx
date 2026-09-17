import {Box, Typography} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import LevelCorrectionModal from '~/pages/admin/kvalitetssikring/modals/LevelCorrectionModal';

interface WizardLevelCorrectionProps {
  onClose: () => void;
}

const LevelCorrection = ({onClose}: WizardLevelCorrectionProps) => {
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
        sx={{
          alignSelf: 'center',
          textAlign: 'center',
          fontWeight: 'bold',
        }}
      >
        Korriger spring
      </Typography>
      <Box
        sx={{
          alignSelf: 'center',
        }}
      >
        <LevelCorrectionModal onClose={onClose} />
      </Box>
    </Box>
  );
};

export default LevelCorrection;
