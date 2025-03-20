import {Box, Divider, Skeleton, Typography} from '@mui/material';
import React from 'react';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import {navIconStyle, qaHistorySkeletonHeight} from '~/consts';
import {AdjustmentTypes, qaAdjustment} from '~/helpers/EnumHelper';
import {useAppContext} from '~/state/contexts';

import {useCertifyQa} from '../api/useCertifyQa';

import AdjustmentDataTable from './AdjustmentDataTable';
import QAGraph from '~/pages/admin/kvalitetssikring/QAGraph';
import CustomSpeedDial from '~/components/CustomSpeedDial';
import {Verified, Delete} from '@mui/icons-material';
import {DialAction} from '~/types';
import {useAdjustmentState} from '~/hooks/useQueryStateParameters';
import {useSetAtom} from 'jotai';
import {
  initiateConfirmTimeseriesAtom,
  initiateSelectAtom,
  levelCorrectionAtom,
} from '~/state/atoms';
import StepWizard from '../wizard/StepWizard';
import DataToShow from '~/pages/admin/kvalitetssikring/components/DataToShow';
import useBreakpoints from '~/hooks/useBreakpoints';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import useQAHistory from '../api/useQAHistory';

export default function QAHistory() {
  const {ts_id} = useAppContext(['ts_id']);
  const [dataAdjustment, setDataAdjustment] = useAdjustmentState();
  const setInitiateSelect = useSetAtom(initiateSelectAtom);
  const setLevelCorrection = useSetAtom(levelCorrectionAtom);
  const setInitiateConfirmTimeseries = useSetAtom(initiateConfirmTimeseriesAtom);
  const {isMobile} = useBreakpoints();
  const speedDialActions: Array<DialAction> = [];
  const {
    get: {data: certify},
  } = useCertifyQa(ts_id);

  const {data, isPending} = useQAHistory(ts_id);

  speedDialActions.push(
    {
      key: 'confirm',
      icon: <Verified />,
      tooltip: <Typography noWrap>Godkend tidsserie</Typography>,
      onClick: () => {
        setInitiateConfirmTimeseries(true);
        setDataAdjustment(qaAdjustment.CONFIRM);
      },
      color: navIconStyle(dataAdjustment === qaAdjustment.CONFIRM),
      toastTip: 'Klik på et datapunkt på grafen',
    },
    {
      key: 'removeData',
      icon: <Delete />,
      tooltip: <Typography noWrap>Fjern data</Typography>,
      onClick: () => {
        setInitiateSelect(true);
        setDataAdjustment(qaAdjustment.REMOVE);
      },
      color: navIconStyle(dataAdjustment === qaAdjustment.REMOVE),
      toastTip: 'Markér et område på grafen',
    },
    {
      key: 'defineValues',
      icon: <DensityLargeIcon />,
      tooltip: <Typography noWrap>Valide værdier</Typography>,
      onClick: () => {
        setInitiateSelect(true);
        setDataAdjustment(qaAdjustment.BOUNDS);
      },
      color: navIconStyle(dataAdjustment === qaAdjustment.BOUNDS),
      toastTip: 'Markér et område på grafen',
    },
    {
      key: 'levelCorrection',
      icon: <HighlightAltIcon />,
      tooltip: <Typography noWrap>Korriger spring</Typography>,
      onClick: () => {
        setLevelCorrection(true);
        setDataAdjustment(qaAdjustment.CORRECTION);
      },
      color: navIconStyle(dataAdjustment === qaAdjustment.CORRECTION),
      toastTip: 'Klik på et datapunkt på grafen',
    }
  );

  if (certify) {
    certify.forEach((item) => {
      data?.push({
        data: item,
        type: AdjustmentTypes.APPROVED,
      });
    });
  }

  if (isPending)
    return (
      <Box>
        <Skeleton
          sx={{
            height: qaHistorySkeletonHeight,
            width: '100%',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
        <Skeleton
          sx={{
            height: qaHistorySkeletonHeight,
            width: '100%',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
        <Skeleton
          sx={{
            height: qaHistorySkeletonHeight,
            width: '100%',
            borderRadius: '5px',
            marginBottom: '10px',
          }}
        />
      </Box>
    );

  return (
    <>
      <Box display="flex" flexDirection={isMobile ? 'column-reverse' : 'row'}>
        <Box width={'100%'}>
          <QAGraph />
        </Box>
        <DataToShow />
      </Box>
      <Divider />
      <StationPageBoxLayout>
        <StepWizard />
        <Box width={'100%'} m="auto" borderRadius={4}>
          <Typography variant="h5">Aktive justeringer</Typography>
          <AdjustmentDataTable data={data} />
        </Box>
        <CustomSpeedDial actions={speedDialActions} />
      </StationPageBoxLayout>
    </>
  );
}
