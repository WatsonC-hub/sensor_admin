import InfoOutlinedIcon from '@mui/icons-material/InfoOutlined';
import {Box, CardContent, Tooltip, Typography} from '@mui/material';
import {useAtomValue} from 'jotai';
import React from 'react';

import LevelCorrectionModal from '~/pages/admin/kvalitetssikring/modals/LevelCorrectionModal';
import {qaSelection} from '~/state/atoms';

const WizardLevelCorrection = () => {
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
        <Box display={'flex'} flexDirection="row" mb={1} gap={1} alignItems={'end'}>
          <Typography alignSelf={'center'} variant="h5" fontWeight={'bold'}>
            Korriger spring
          </Typography>
          <Tooltip
            placement="right"
            open={true}
            arrow={true}
            title={
              <p>
                På denne side af guiden kan du rette en specifik hændelse i tidsserien, f.eks. en
                unaturlig spike eller et niveauspring. Markér venligst ét punkt på grafen, som du
                ønsker at rette, for at starte behandlingen.
              </p>
            }
          >
            <InfoOutlinedIcon />
          </Tooltip>
        </Box>
        <Box alignSelf={'center'}>{'points' in selection && <LevelCorrectionModal />}</Box>
      </CardContent>
    </Box>
  );
};

export default WizardLevelCorrection;
