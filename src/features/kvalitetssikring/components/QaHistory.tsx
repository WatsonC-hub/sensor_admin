import {Box, Divider, Grid, Skeleton, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import {apiClient} from '~/apiClient';
import {navIconStyle, qaHistorySkeletonHeight} from '~/consts';
import {AdjustmentTypes, qaAdjustment} from '~/helpers/EnumHelper';
import {useAppContext} from '~/state/contexts';

import {useCertifyQa} from '../api/useCertifyQa';

import AdjustmentDataTable from './AdjustmentDataTable';
import PlotGraph from '~/pages/admin/kvalitetssikring/QAGraph';
import CustomSpeedDial from '~/components/CustomSpeedDial';
import {Verified, Delete} from '@mui/icons-material';
import {DialAction} from '~/types';
import {useAdjustmentState} from '~/hooks/useQueryStateParameters';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {useSetAtom} from 'jotai';
import {
  initiateConfirmTimeseriesAtom,
  initiateSelectAtom,
  levelCorrectionAtom,
} from '~/state/atoms';
import StepWizard from '../wizard/StepWizard';
import DataToShow from '~/pages/admin/kvalitetssikring/components/DataToShow';
import useBreakpoints from '~/hooks/useBreakpoints';

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

  const {data, isPending} = useQuery({
    queryKey: ['qa_all', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_admin/qa_all/${ts_id}`);
      return data;
    },
    select: (data) => {
      const out = [];

      data.levelcorrection.forEach((item: any) => {
        out.push({
          data: item,
          type: AdjustmentTypes.LEVELCORRECTION,
        });
      });

      data.dataexclude.forEach((item: any) => {
        if (item.max_value == null) {
          out.push({
            data: item,
            type: AdjustmentTypes.EXLUDETIME,
          });
        } else {
          out.push({
            data: item,
            type: AdjustmentTypes.EXLUDEPOINTS,
          });
        }
      });
      if (data.min_max_cutoff) {
        out.push({
          data: data.min_max_cutoff,
          type: AdjustmentTypes.MINMAX,
        });
      }

      return out;
    },
    enabled: typeof ts_id == 'number',
    refetchOnWindowFocus: false,
  });

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
      <Box display={'flex'} flexDirection={'row'} sx={{marginBottom: 0.5}}>
        <Grid container direction={isMobile ? 'column-reverse' : 'row'}>
          <Grid item tablet={10}>
            <PlotGraph ts_id={ts_id} />
          </Grid>
          <Grid item tablet={1}>
            <DataToShow />
          </Grid>
        </Grid>
        <Divider />
        <CustomSpeedDial actions={speedDialActions} />
      </Box>
      <Box maxWidth={isMobile ? '100%' : 1080}>
        <StationPageBoxLayout>
          <StepWizard />
          <Grid item tablet={12} laptop={7} desktop={7} xl={7}>
            <AdjustmentDataTable data={data} />
          </Grid>
        </StationPageBoxLayout>
      </Box>
    </>
  );
}
