import {Box, CardContent, Typography} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import LevelCorrectionModal from '~/pages/admin/kvalitetssikring/modals/LevelCorrectionModal';

interface WizardLevelCorrectionProps {
  onClose: () => void;
}

const WizardLevelCorrection = ({onClose}: WizardLevelCorrectionProps) => {
  const {isMobile} = useBreakpoints();

  return (
    <Box alignSelf={'center'} width={'inherit'} height={'inherit'} justifySelf={'center'}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
          alignContent: 'center',
        }}
      >
        <Box
          display={'flex'}
          flexDirection="row"
          justifyContent={'center'}
          mb={1}
          gap={1}
          alignItems={'end'}
        >
          <Typography alignSelf={'center'} variant={isMobile ? 'h6' : 'h5'} fontWeight={'bold'}>
            Korriger spring
          </Typography>
        </Box>
        <Box alignSelf={'center'}>
          <LevelCorrectionModal onClose={onClose} />
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardLevelCorrection;
