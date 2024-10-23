import {Box, CardContent, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import ExcludeModal from '~/pages/admin/kvalitetssikring/modals/ExcludeModal';
import {qaSelection} from '~/state/atoms';

const WizardDataExclude = () => {
  const selection = useAtomValue(qaSelection);

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
        <Box display={'flex'} flexDirection="column" mb={3} justifyContent={'center'}>
          <Typography alignSelf={'center'} variant="h5" component="h2" fontWeight={'bold'}>
            Fjern punkter fra tidsserien
          </Typography>
          <Typography sx={{wordWrap: 'break-word'}}>
            På denne side af guiden har du mulighed for at fjerne punkter som du mener der er fejl
            i. Markér området som skal fjernes fra grafen.
          </Typography>
        </Box>
        <Box alignSelf={'center'}>
          {'range' in selection && (
            <ExcludeModal
            // onClose={() => {
            //   setInitiateSelect(false);
            //   setStep(0);
            // }}
            />
          )}
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardDataExclude;
