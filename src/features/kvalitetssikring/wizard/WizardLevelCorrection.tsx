import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import {Box, CardContent, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import Button from '~/components/Button';
import LevelCorrectionModal from '~/pages/admin/kvalitetssikring/modals/LevelCorrectionModal';
import {qaSelection} from '~/state/atoms';

type WizardLevelCorrectionProps = {
  setStep: (value: number) => void;
  setInitiateSelect: (initiateSelect: boolean) => void;
};

const WizardLevelCorrection = ({setStep, setInitiateSelect}: WizardLevelCorrectionProps) => {
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
            Korriger spring
          </Typography>
          <Typography sx={{wordWrap: 'break-word'}}>
            På denne side af guiden kan du rette en specifik hændelse i tidsserien, f.eks. en
            unaturlig spike eller et niveauspring. Tryk på knappen, og markér venligst ét punkt på
            grafen, som du ønsker at rette, for at starte behandlingen.
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
            Markér et punkt
          </Button>
        </Box>
        <Box alignSelf={'center'}>
          {'range' in selection &&
            'points' in selection &&
            (selection.points as Array<{x: string; y: number}>).length === 2 && (
              <LevelCorrectionModal
                onClose={() => {
                  setInitiateSelect(false);
                  setStep(0);
                }}
              />
            )}
        </Box>
      </CardContent>
    </Box>
  );
};

export default WizardLevelCorrection;
