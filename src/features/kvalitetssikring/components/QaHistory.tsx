import {
  Box,
  Dialog,
  DialogActions,
  DialogContent,
  Divider,
  Skeleton,
  Typography,
} from '@mui/material';
import React, {useState} from 'react';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import {navIconStyle, qaHistorySkeletonHeight} from '~/consts';
import {AdjustmentTypes, qaAdjustment} from '~/helpers/EnumHelper';
import {useAppContext} from '~/state/contexts';

import {useCertifyQa} from '../api/useCertifyQa';

import AdjustmentDataTable from './AdjustmentDataTable';
import QAGraph from '~/pages/admin/kvalitetssikring/QAGraph';
import CustomSpeedDial, {CustomTooltip} from '~/components/CustomSpeedDial';
import {Verified, Delete, Save} from '@mui/icons-material';
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
import moment from 'moment';
import Button from '~/components/Button';
import {toast} from 'react-toastify';
import GraphManager from '~/features/station/components/GraphManager';

export default function QAHistory() {
  const {ts_id} = useAppContext(['ts_id']);
  const [dataAdjustment, setDataAdjustment] = useAdjustmentState();
  const setInitiateSelect = useSetAtom(initiateSelectAtom);
  const setLevelCorrection = useSetAtom(levelCorrectionAtom);
  const setInitiateConfirmTimeseries = useSetAtom(initiateConfirmTimeseriesAtom);
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false);
  const {isMobile} = useBreakpoints();
  const speedDialActions: Array<DialAction> = [];
  const {
    get: {data: certify},
    post: postQaData,
  } = useCertifyQa(ts_id);

  const {data, isPending} = useQAHistory(ts_id);

  speedDialActions.push(
    {
      key: 'confirm',
      icon: <Verified />,
      tooltip: <Typography noWrap>Godkend tidsserie</Typography>,
      onClick: () => {
        setConfirmDialogOpen(true);
      },
      color: navIconStyle(dataAdjustment === qaAdjustment.CONFIRM),
      toastTip: 'Klik på et datapunkt på grafen',
      dialog: confirmDialogOpen,
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

  const showConfirmWizard = () => {
    setConfirmDialogOpen(false);
    setInitiateConfirmTimeseries(true);
    setDataAdjustment(qaAdjustment.CONFIRM);
    if (toast.isActive('juster'))
      toast.update('juster', {
        render: <CustomTooltip toastContent="Klik på et datapunkt på grafen" />,
        style: {display: 'flex'},
      });
    else if (!toast.isActive('juster'))
      toast(<CustomTooltip toastContent="Klik på et datapunkt på grafen" />, {
        autoClose: false,
        toastId: 'juster',
        style: {
          display: 'flex',
          flexDirection: 'row',
          justifyContent: 'center',
        },
      });
  };

  const handleSubmit = () => {
    const payload = {
      path: `${ts_id}`,
      data: {level: 1, date: moment().toISOString()},
    };
    postQaData.mutate(payload);
    setDataAdjustment(null);
    setConfirmDialogOpen(false);
  };

  const dialog = (
    <Dialog open={confirmDialogOpen} onClose={() => setConfirmDialogOpen(false)}>
      <DialogContent>
        <Box display={'flex'} flexDirection="column" gap={1}>
          <Typography variant="body2" fontWeight={'bold'}>
            Vil du gerne godkende tidsserien frem til dagens dato? <br />
          </Typography>
        </Box>
      </DialogContent>
      <DialogActions>
        <Button bttype="tertiary" onClick={() => showConfirmWizard()}>
          Nej
        </Button>
        <Button bttype="primary" startIcon={<Save />} onClick={handleSubmit}>
          Godkend
        </Button>
      </DialogActions>
    </Dialog>
  );

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
          <GraphManager />
        </Box>
        {/* <DataToShow /> */}
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
      {dialog}
    </>
  );
}
