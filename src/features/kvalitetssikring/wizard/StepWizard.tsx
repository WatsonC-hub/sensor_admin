import {Box, Card, CardContent} from '@mui/material';
import {useSetAtom} from 'jotai';
import React, {useEffect} from 'react';

import {QaAdjustment} from '~/helpers/EnumHelper';
import {useSearchParam} from '~/hooks/useSeachParam';
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
  const [dataAdjustment] = useSearchParam('adjust', null);
  const setSelection = useSetAtom(qaSelection);

  useEffect(() => {
    setSelection({});
    setInitiateSelect(
      dataAdjustment === QaAdjustment.BOUNDS || dataAdjustment === QaAdjustment.REMOVE
    );
    setInitiateConfirmTimeseries(dataAdjustment === QaAdjustment.CONFIRM);
    setLevelCorrection(dataAdjustment === QaAdjustment.CORRECTION);
  }, [dataAdjustment]);

  return (
    <Box height={'fit-content'} alignItems={'center'}>
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
        elevation={12}
      >
        <CardContent sx={{height: '95%'}}>
          <Box width={'inherit'} height={'inherit'}>
            {dataAdjustment === QaAdjustment.CONFIRM && (
              <WizardConfirmTimeseries initiateConfirmTimeseries={initiateConfirmTimeseries} />
            )}
            {dataAdjustment === QaAdjustment.REMOVE && <WizardDataExclude />}
            {dataAdjustment === QaAdjustment.BOUNDS && <WizardValueBounds />}
            {dataAdjustment === QaAdjustment.CORRECTION && <WizardLevelCorrection />}
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default StepWizard;
