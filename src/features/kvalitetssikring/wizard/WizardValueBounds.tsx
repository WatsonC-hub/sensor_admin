import {Box, CardContent, Typography} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import YRangeModal from '~/pages/admin/kvalitetssikring/modals/YRangeModal';

interface WizardValueBoundsProps {
  onClose: () => void;
}

const WizardValueBounds = ({onClose}: WizardValueBoundsProps) => {
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
          <Typography
            alignSelf={'center'}
            variant={isMobile ? 'h6' : 'h5'}
            component="h2"
            fontWeight={'bold'}
          >
            Øvre og nedre værdigrænser
          </Typography>
        </Box>
        <Box alignSelf={'center'}>
          <YRangeModal onClose={onClose} />
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardValueBounds;
