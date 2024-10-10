import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import {Box, CardContent, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import Button from '~/components/Button';
import ExcludeModal from '~/pages/admin/kvalitetssikring/modals/ExcludeModal';
import {qaSelection} from '~/state/atoms';

type WizardDataExcludeProps = {
  setStep: (value: number) => void;
  setInitiateSelect: (initiateSelect: boolean) => void;
};

const WizardDataExclude = ({setInitiateSelect}: WizardDataExcludeProps) => {
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
            i. Tryk på knappen nedenfor og derefter marker området på grafen som skal fjernes.
          </Typography>
        </Box>
        <Box display={'flex'} flexDirection="column" mb={3} alignSelf={'center'}>
          <Button
            startIcon={<HighlightAltIcon />}
            bttype={'primary'}
            disabled={false}
            onClick={() => {
              setInitiateSelect(true);
            }}
          >
            Markér punkter
          </Button>
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
