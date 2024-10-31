import {Box, CardContent, Typography} from '@mui/material';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import ExcludeModal from '~/pages/admin/kvalitetssikring/modals/ExcludeModal';

interface WizardDataExcludeProps {
  onClose: () => void;
}

const WizardDataExclude = ({onClose}: WizardDataExcludeProps) => {
  const {isMobile} = useBreakpoints();
  return (
    <Box alignSelf={'center'} width={'inherit'} height={'inherit'} justifySelf={'center'}>
      <CardContent
        sx={{
          display: 'flex',
          flexDirection: 'column',
          height: 'inherit',
          alignContent: 'center',
          justifyContent: 'center',
          gap: 2,
        }}
      >
        <Box
          display={'flex'}
          flexDirection="row"
          justifyContent={'center'}
          mb={1}
          alignItems={'end'}
        >
          <Typography
            alignSelf={'center'}
            variant={isMobile ? 'h6' : 'h5'}
            component="h2"
            fontWeight={'bold'}
          >
            Fjern punkter fra tidsserien
          </Typography>
        </Box>
        <Box alignSelf={'center'}>
          <ExcludeModal onClose={onClose} />
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardDataExclude;
