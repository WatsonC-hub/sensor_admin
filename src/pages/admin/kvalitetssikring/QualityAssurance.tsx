import {Delete, Verified} from '@mui/icons-material';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import FunctionsIcon from '@mui/icons-material/Functions';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {Box, Divider, Grid, Typography} from '@mui/material';
import {startCase} from 'lodash';
import React, {ReactNode, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import CustomBottomNavigation from '~/components/BottomNavigation';
import CustomSpeedDial from '~/components/CustomSpeedDial';
import NavBar from '~/components/NavBar';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import QAHistory from '~/features/kvalitetssikring/components/QaHistory';
import StepWizard from '~/features/kvalitetssikring/wizard/StepWizard';
import {qaAdjustment, qaPages} from '~/helpers/EnumHelper';
import {useMetadata} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useSearchParam} from '~/hooks/useSeachParam';
import Algorithms from '~/pages/admin/kvalitetssikring/Algorithms';
import DataToShow from '~/pages/admin/kvalitetssikring/components/DataToShow';
import {MetadataContext} from '~/state/contexts';
import {DialAction} from '~/types';

import PlotGraph from './QAGraph';

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'white';
};

const QualityAssurance = () => {
  const params = useParams();
  const [pageToShow] = useSearchParam('page');
  const [dataAdjustment, setDataAdjustment] = useSearchParam('adjust');

  const {isMobile} = useBreakpoints();
  const [initiateSelect, setInitiateSelect] = useState(false);
  const [levelCorrection, setLevelCorrection] = useState(false);
  const [initiateConfirmTimeseries, setInitiateConfirmTimeseries] = useState(false);

  const {data} = useMetadata(params.ts_id ? parseInt(params.ts_id) : -1);

  const speedDialActions: Array<DialAction> = [];

  useEffect(() => {
    if (pageToShow !== qaPages.DATA) {
      setDataAdjustment(null);
    }
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
      toastTip: 'Vælg et punkt på grafen',
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
      tooltip: <Typography noWrap>Definer værdier</Typography>,
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
      toastTip: 'Vælg et punkt på grafen',
    }
  );

  if (!isMobile) {
    return (
      <Layout
        data={data}
        ts_id={params.ts_id ? parseInt(params.ts_id) : -1}
        initiateSelect={initiateSelect}
        setInitiateSelect={setInitiateSelect}
        levelCorrection={levelCorrection}
        initiateConfirmTimeseries={initiateConfirmTimeseries}
      >
        <Grid item tablet={1}>
          <DataToShow />
        </Grid>
        <Box borderRadius={4} m={'auto'} width={'100%'} maxWidth={1200}>
          <Box display={'flex'} flexDirection={'column'}>
            {pageToShow === qaPages.DATA && (
              <>
                <Grid container gap={3} justifyContent={'center'}>
                  <Grid item tablet={12} laptop={7} desktop={7} xl={7}>
                    <StepWizard
                      setLevelCorrection={setLevelCorrection}
                      initiateConfirmTimeseries={initiateConfirmTimeseries}
                      setInitiateSelect={setInitiateSelect}
                      setInitiateConfirmTimeseries={setInitiateConfirmTimeseries}
                    />
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
    <Layout
      data={data}
      ts_id={params.ts_id ? parseInt(params.ts_id) : -1}
      initiateSelect={initiateSelect}
      setInitiateSelect={setInitiateSelect}
      levelCorrection={levelCorrection}
      initiateConfirmTimeseries={initiateConfirmTimeseries}
    >
      <Box borderRadius={4} width={'100%'} m={'auto'} maxWidth={1200}>
        <Grid item mobile={12}>
          {pageToShow === qaPages.DATA && (
            <Box display="flex" flexDirection={'column'} gap={2}>
              {dataAdjustment !== null && (
                <StepWizard
                  setLevelCorrection={setLevelCorrection}
                  initiateConfirmTimeseries={initiateConfirmTimeseries}
                  setInitiateSelect={setInitiateSelect}
                  setInitiateConfirmTimeseries={setInitiateConfirmTimeseries}
                />
              )}
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
  data: any;
  ts_id: number;
  initiateSelect: boolean;
  setInitiateSelect: (value: boolean) => void;
  levelCorrection: boolean;
  children: ReactNode;
  initiateConfirmTimeseries: boolean;
}

const Layout = ({
  data,
  ts_id,
  initiateSelect,
  setInitiateSelect,
  levelCorrection,
  initiateConfirmTimeseries,
  children,
}: LayoutProps) => {
  const [pageToShow, setPageToShow] = useSearchParam('page');
  const {isMobile} = useBreakpoints();
  const handleChange = (event: any, newValue: string | null) => {
    setPageToShow(newValue);
  };

  const {handlePrefetch} = useAlgorithms(ts_id.toString());

  const navigationItems = [];

  navigationItems.push(
    {
      text: 'Justering',
      value: qaPages.DATA,
      icon: <QueryStatsIcon />,
      color: navIconStyle(pageToShow === qaPages.DATA),
    },
    {
      text: startCase(qaPages.ALGORITHMS),
      value: qaPages.ALGORITHMS,
      icon: <FunctionsIcon />,
      color: navIconStyle(pageToShow === qaPages.ALGORITHMS),
      handlePrefetch: handlePrefetch,
    }
  );

  return (
    <MetadataContext.Provider value={data}>
      <NavBar />

      <Grid container gap={1}>
        {isMobile && <DataToShow />}
        <Grid item mobile={12} tablet={9} laptop={10}>
          <Box
            display={'flex'}
            flexDirection={'column'}
            gap={5}
            sx={{marginBottom: 0.5, marginTop: 0.2}}
          >
            <PlotGraph
              ts_id={ts_id}
              initiateSelect={initiateSelect}
              setInitiateSelect={setInitiateSelect}
              levelCorrection={levelCorrection}
              initiateConfirmTimeseries={initiateConfirmTimeseries}
            />
            <Divider />
          </Box>
        </Grid>
        {children}
      </Grid>
      <CustomBottomNavigation
        pageToShow={pageToShow}
        onChange={handleChange}
        items={navigationItems}
      />
    </MetadataContext.Provider>
  );
};
