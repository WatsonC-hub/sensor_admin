import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import {Box, CardContent, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import Button from '~/components/Button';
import YRangeModal from '~/pages/admin/kvalitetssikring/modals/YRangeModal';
import {qaSelection} from '~/state/atoms';

type WizardValueBoundsProps = {
  setStep: (value: number) => void;
  setInitiateSelect: (initiateSelect: boolean) => void;
};

const WizardValueBounds = ({setStep, setInitiateSelect}: WizardValueBoundsProps) => {
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
            Øvre og nedre værdigrænser
          </Typography>
          <Typography sx={{wordWrap: 'break-word'}}>
            På denne side af guiden kan du definere de øvre og nedre grænseværdier. Kun punkter
            inden for disse grænser vil være gyldige, og alle punkter udenfor vil blive fjernet.
          </Typography>
        </Box>
        <Box display={'flex'} flexDirection="column" mb={3} alignSelf={'center'}>
          <Button
            startIcon={<DensityLargeIcon />}
            bttype={'primary'}
            disabled={false}
            onClick={() => {
              setInitiateSelect(true);
            }}
          >
            Markér grænseværdier
          </Button>
        </Box>
        <Box alignSelf={'center'}>{'range' in selection && <YRangeModal />}</Box>
      </CardContent>
    </Box>
  );
};

export default WizardValueBounds;
