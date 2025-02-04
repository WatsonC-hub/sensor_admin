import {Box, Typography} from '@mui/material';
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
      <Typography
        variant={isMobile ? 'h6' : 'h5'}
        component="h2"
        textAlign={'center'}
        fontWeight={'bold'}
        mb={0.5}
      >
        Fjern punkter fra tidsserien
      </Typography>
      <ExcludeModal onClose={onClose} />
    </Box>
  );
};

export default WizardDataExclude;
