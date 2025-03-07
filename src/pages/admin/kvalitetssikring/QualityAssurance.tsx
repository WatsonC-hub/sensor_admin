import {Delete, Verified} from '@mui/icons-material';
import BuildCircleIcon from '@mui/icons-material/BuildCircle';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import FunctionsIcon from '@mui/icons-material/Functions';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {Box, Divider, Grid, Typography} from '@mui/material';
import React, {ReactNode, useEffect} from 'react';

import CustomBottomNavigation from '~/components/BottomNavigation';
import CustomSpeedDial from '~/components/CustomSpeedDial';
import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import QAHistory from '~/features/kvalitetssikring/components/QaHistory';
import StepWizard from '~/features/kvalitetssikring/wizard/StepWizard';
import {qaAdjustment, qaPages, qaPagesLiteral} from '~/helpers/EnumHelper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useAdjustmentState, useQAPageState} from '~/hooks/useQueryStateParameters';
import Algorithms from '~/pages/admin/kvalitetssikring/Algorithms';
import DataToShow from '~/pages/admin/kvalitetssikring/components/DataToShow';
import {useAppContext} from '~/state/contexts';
import {DialAction} from '~/types';

import PlotGraph from './QAGraph';
import {useSetAtom} from 'jotai';
import {
  initiateConfirmTimeseriesAtom,
  initiateSelectAtom,
  levelCorrectionAtom,
} from '~/state/atoms';

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

const QualityAssurance = () => {
  const [pageToShow] = useQAPageState();
  const [dataAdjustment, setDataAdjustment] = useAdjustmentState();

  const {isMobile} = useBreakpoints();
  const setInitiateSelect = useSetAtom(initiateSelectAtom);
  const setLevelCorrection = useSetAtom(levelCorrectionAtom);
  const setInitiateConfirmTimeseries = useSetAtom(initiateConfirmTimeseriesAtom);

  const speedDialActions: Array<DialAction> = [];
  useEffect(() => {
    setDataAdjustment(null);
  }, [pageToShow]);

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

  if (!isMobile) {
    return (
      <Layout>
        <Grid item tablet={1}>
          <DataToShow />
        </Grid>
        <Box borderRadius={4} m={'auto'} width={'100%'} maxWidth={1200}>
          <Box display={'flex'} flexDirection={'column'}>
            {pageToShow === qaPages.JUSTERINGER && (
              <>
                <Grid container gap={3} justifyContent={'center'}>
                  <Grid item tablet={12} laptop={7} desktop={7} xl={7}>
                    <StepWizard />
                  </Grid>
                  <Grid item tablet={12} laptop={7} desktop={7} xl={7}>
                    <Box display={'flex'} flexDirection={'column'} borderRadius={4}>
                      <Typography variant="h5">Aktive justeringer</Typography>
                      <QAHistory />
                      {/* <QAHistory /> */}
                    </Box>
                  </Grid>
                </Grid>
                <CustomSpeedDial actions={speedDialActions} />
              </>
            )}
            {pageToShow === qaPages.ALGORITHMS && <Algorithms />}
          </Box>
        </Box>
      </Layout>
    );
  }

  return (
    <Layout>
      <Box borderRadius={4} width={'100%'} m={'auto'} maxWidth={1200}>
        <Grid item mobile={12}>
          {pageToShow === qaPages.JUSTERINGER && (
            <Box display="flex" flexDirection={'column'} gap={2}>
              {dataAdjustment !== null && <StepWizard />}
              <QAHistory />
              <CustomSpeedDial actions={speedDialActions} />
            </Box>
          )}
          {pageToShow === qaPages.ALGORITHMS && <Algorithms />}
        </Grid>
      </Box>
    </Layout>
  );
};

export default QualityAssurance;

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const [pageToShow, setPageToShow] = useQAPageState();
  const {isMobile} = useBreakpoints();
  const {ts_id} = useAppContext(['ts_id']);
  const {field, station} = useNavigationFunctions();
  const {data: timeseries_data} = useTimeseriesData();
  const handleChange = (event: any, newValue: (typeof qaPagesLiteral)[number]) => {
    setPageToShow(newValue);
  };

  const {handlePrefetch} = useAlgorithms(ts_id);

  const navigationItems = [];

  navigationItems.push(
    {
      text: 'Justering',
      value: 'justeringer' as const,
      icon: <QueryStatsIcon />,
      color: navIconStyle(pageToShow === qaPages.JUSTERINGER),
    },
    {
      text: 'Algoritmer',
      value: 'algoritmer' as const,
      icon: <FunctionsIcon />,
      color: navIconStyle(pageToShow === qaPages.ALGORITHMS),
      handlePrefetch: handlePrefetch,
    }
  );

  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <NavBar.Title title="Kvalitetssikring" />
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <NotificationList />
          <NavBar.Menu
            highligtFirst={!isMobile}
            items={[
              {
                title: 'Til service',
                icon: <QueryStatsIcon />,
                onClick: () => {
                  station(timeseries_data?.loc_id, timeseries_data?.ts_id);
                },
              },
              {
                title: 'Field',
                icon: <BuildCircleIcon fontSize="medium" />,
                onClick: () => {
                  field();
                },
              },
            ]}
          />
        </Box>
      </NavBar>
      <Grid container gap={1}>
        {isMobile && <DataToShow />}
        <Grid item mobile={12} tablet={9} laptop={10}>
          <Box
            display={'flex'}
            flexDirection={'column'}
            gap={5}
            sx={{marginBottom: 0.5, marginTop: 0.2}}
          >
            <PlotGraph ts_id={ts_id} />
            <Divider />
          </Box>
        </Grid>
        {children}
      </Grid>
      <CustomBottomNavigation<(typeof qaPagesLiteral)[number]>
        pageToShow={pageToShow}
        onChange={handleChange}
        items={navigationItems}
      />
    </>
  );
};
