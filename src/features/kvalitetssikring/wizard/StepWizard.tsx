import {Box, Card, CardContent} from '@mui/material';
import {useAtom} from 'jotai';
import {parseAsString, useQueryState} from 'nuqs';
import React, {useEffect} from 'react';
import {toast} from 'react-toastify';

import {qaAdjustment} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {qaSelection} from '~/state/atoms';

import WizardConfirmTimeseries from './WizardConfirmTimeseries';
import WizardDataExclude from './WizardExcludeData';
import WizardLevelCorrection from './WizardLevelCorrection';
import WizardValueBounds from './WizardValueBounds';

interface StepWizardProps {
  setLevelCorrection: (levelCorrection: boolean) => void;
  initiateConfirmTimeseries: boolean;
  setInitiateSelect: (initiateSelect: boolean) => void;
  setInitiateConfirmTimeseries: (confirm: boolean) => void;
}

const StepWizard = ({
  setLevelCorrection,
  initiateConfirmTimeseries,
  setInitiateSelect,
  setInitiateConfirmTimeseries,
}: StepWizardProps) => {
  const [dataAdjustment] = useQueryState('adjust', parseAsString);
  const [selection, setSelection] = useAtom(qaSelection);
  const {isMobile} = useBreakpoints();

  useEffect(() => {
    setSelection({});
    setInitiateSelect(
      dataAdjustment === qaAdjustment.BOUNDS || dataAdjustment === qaAdjustment.REMOVE
    );
    setInitiateConfirmTimeseries(dataAdjustment === qaAdjustment.CONFIRM);
    setLevelCorrection(dataAdjustment === qaAdjustment.CORRECTION);
  }, [dataAdjustment]);

  useEffect(() => {
    const points =
      selection.points &&
      selection.points.length === 1 &&
      isMobile &&
      (dataAdjustment === qaAdjustment.CONFIRM || dataAdjustment === qaAdjustment.CORRECTION);
    const range =
      selection.range &&
      isMobile &&
      (dataAdjustment === qaAdjustment.REMOVE || dataAdjustment === qaAdjustment.BOUNDS);

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
            width: 'inherit',
            height: 'inherit',
            display: 'flex',
            flexDirection: 'column',
            flex: '1 0 auto',
            borderRadius: 4,
          }}
          elevation={2}
        >
          <CardContent sx={{height: '95%'}}>
            <Box width={'inherit'} height={'inherit'}>
              {dataAdjustment === qaAdjustment.CONFIRM && (
                <WizardConfirmTimeseries
                  initiateConfirmTimeseries={initiateConfirmTimeseries}
                  onClose={handleOnClose}
                />
              )}
              {dataAdjustment === qaAdjustment.REMOVE && (
                <WizardDataExclude onClose={handleOnClose} />
              )}
              {dataAdjustment === qaAdjustment.BOUNDS && (
                <WizardValueBounds onClose={handleOnClose} />
              )}
              {dataAdjustment === qaAdjustment.CORRECTION && (
                <WizardLevelCorrection onClose={handleOnClose} />
              )}
            </Box>
          </CardContent>
        </Card>
      )}
    </Box>
  );
};

export default StepWizard;
