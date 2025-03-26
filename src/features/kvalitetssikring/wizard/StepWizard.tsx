import {Box, Card, CardContent} from '@mui/material';
import {useAtom, useSetAtom} from 'jotai';
import {parseAsStringLiteral, useQueryState} from 'nuqs';
import React, {useEffect} from 'react';
import {toast} from 'react-toastify';

import {qaAdjustmentLiteral} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {
  initiateConfirmTimeseriesAtom,
  initiateSelectAtom,
  levelCorrectionAtom,
  qaSelection,
} from '~/state/atoms';

import WizardConfirmTimeseries from './WizardConfirmTimeseries';
import WizardDataExclude from './WizardExcludeData';
import WizardLevelCorrection from './WizardLevelCorrection';
import WizardValueBounds from './WizardValueBounds';

const StepWizard = () => {
  const [dataAdjustment] = useQueryState('adjust', parseAsStringLiteral(qaAdjustmentLiteral));
  const [selection, setSelection] = useAtom(qaSelection);
  const {isMobile} = useBreakpoints();
  const setInitiateSelect = useSetAtom(initiateSelectAtom);
  const setLevelCorrection = useSetAtom(levelCorrectionAtom);
  const [initiateConfirmTimeseries, setInitiateConfirmTimeseries] = useAtom(
    initiateConfirmTimeseriesAtom
  );

  useEffect(() => {
    setSelection({});
    setInitiateSelect(dataAdjustment === 'bounds' || dataAdjustment === 'remove');
    setInitiateConfirmTimeseries(dataAdjustment === 'confirm');
    setLevelCorrection(dataAdjustment === 'correction');
  }, [dataAdjustment]);

  useEffect(() => {
    const points =
      selection.points &&
      selection.points.length === 1 &&
      isMobile &&
      (dataAdjustment === 'confirm' || dataAdjustment === 'correction');
    const range =
      selection.range && isMobile && (dataAdjustment === 'remove' || dataAdjustment === 'bounds');

    if (points || range) scrollTo({top: 450});
  }, [selection]);

  const dismiss = () => {
    toast.dismiss('juster');
  };

  const handleOnClose = () => {
    setInitiateConfirmTimeseries(false);
    setInitiateSelect(false);
    setLevelCorrection(false);
    dismiss();
    setSelection({});
  };

  return (
    <Box height={'fit-content'} alignItems={'center'}>
      {(selection.range || selection.points) && dataAdjustment !== null && (
        <Card
          raised={true}
          sx={{
            display: 'flex',
            flexDirection: 'column',
            borderRadius: 4,
          }}
          elevation={2}
        >
          <CardContent sx={{height: '100%'}}>
            <Box>
              {dataAdjustment === 'confirm' && (
                <WizardConfirmTimeseries
                  initiateConfirmTimeseries={initiateConfirmTimeseries}
                  onClose={handleOnClose}
                />
              )}
              {dataAdjustment === 'remove' && <WizardDataExclude onClose={handleOnClose} />}
              {dataAdjustment === 'bounds' && <WizardValueBounds onClose={handleOnClose} />}
              {dataAdjustment === 'correction' && <WizardLevelCorrection onClose={handleOnClose} />}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StepWizard;
