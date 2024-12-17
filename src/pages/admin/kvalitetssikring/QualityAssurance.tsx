import {Delete, Verified} from '@mui/icons-material';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import FunctionsIcon from '@mui/icons-material/Functions';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {Box, Divider, Grid, Typography} from '@mui/material';
import {useQueryState, parseAsStringLiteral} from 'nuqs';
import React, {ReactNode, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import CustomBottomNavigation from '~/components/BottomNavigation';
import CustomSpeedDial from '~/components/CustomSpeedDial';
import NavBar from '~/components/NavBar';
import {useAlgorithms} from '~/features/kvalitetssikring/api/useAlgorithms';
import QAHistory from '~/features/kvalitetssikring/components/QaHistory';
import StepWizard from '~/features/kvalitetssikring/wizard/StepWizard';
import {qaPagesLiteral, qaAdjustmentLiteral} from '~/helpers/EnumHelper';
import {useMetadata} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
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
  const [pageToShow] = useQueryState(
    'page',
    parseAsStringLiteral(qaPagesLiteral).withDefault('justeringer')
  );
  const [dataAdjustment, setDataAdjustment] = useQueryState(
    'adjust',
    parseAsStringLiteral(qaAdjustmentLiteral)
  );

  const {isMobile} = useBreakpoints();
  const [initiateSelect, setInitiateSelect] = useState(false);
  const [levelCorrection, setLevelCorrection] = useState(false);
  const [initiateConfirmTimeseries, setInitiateConfirmTimeseries] = useState(false);

  const {data} = useMetadata(params.ts_id ? parseInt(params.ts_id) : -1);

  const speedDialActions: Array<DialAction> = [];
  useEffect(() => {
    // if (pageToShow !== qaPages.DATA) {
    setDataAdjustment(null);
    // }
  }, [pageToShow]);

  speedDialActions.push(
    {
      key: 'confirm',
      icon: <Verified />,
      tooltip: <Typography noWrap>Godkend tidsserie</Typography>,
      onClick: () => {
        setInitiateConfirmTimeseries(true);
        setDataAdjustment('confirm');
      },
      color: navIconStyle(dataAdjustment === 'confirm'),
      toastTip: 'Klik på et datapunkt på grafen',
    },
    {
      key: 'removeData',
      icon: <Delete />,
      tooltip: <Typography noWrap>Fjern data</Typography>,
      onClick: () => {
        setInitiateSelect(true);
        setDataAdjustment('remove');
      },
      color: navIconStyle(dataAdjustment === 'remove'),
      toastTip: 'Markér et område på grafen',
    },
    {
      key: 'defineValues',
      icon: <DensityLargeIcon />,
      tooltip: <Typography noWrap>Valide værdier</Typography>,
      onClick: () => {
        setInitiateSelect(true);
        setDataAdjustment('bounds');
      },
      color: navIconStyle(dataAdjustment === 'bounds'),
      toastTip: 'Markér et område på grafen',
    },
    {
      key: 'levelCorrection',
      icon: <HighlightAltIcon />,
      tooltip: <Typography noWrap>Korriger spring</Typography>,
      onClick: () => {
        setLevelCorrection(true);
        setDataAdjustment('correction');
      },
      color: navIconStyle(dataAdjustment === 'correction'),
      toastTip: 'Klik på et datapunkt på grafen',
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
            {pageToShow === 'justeringer' && (
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
            {pageToShow === 'algoritmer' && <Algorithms />}
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
          {pageToShow === 'justeringer' && (
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
          {pageToShow === 'algoritmer' && <Algorithms />}
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
  const [pageToShow, setPageToShow] = useQueryState(
    'page',
    parseAsStringLiteral(qaPagesLiteral).withDefault('justeringer')
  );
  const {isMobile} = useBreakpoints();
  const handleChange = (event: any, newValue: (typeof qaPagesLiteral)[number]) => {
    setPageToShow(newValue);
  };

  const {handlePrefetch} = useAlgorithms(ts_id.toString());

  const navigationItems = [];

  navigationItems.push(
    {
      text: 'Justering',
      value: 'justeringer' as const,
      icon: <QueryStatsIcon />,
      color: navIconStyle(pageToShow === 'justeringer'),
    },
    {
      text: 'Algoritmer',
      value: 'algoritmer' as const,
      icon: <FunctionsIcon />,
      color: navIconStyle(pageToShow === 'algoritmer'),
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
      <CustomBottomNavigation<(typeof qaPagesLiteral)[number]>
        pageToShow={pageToShow}
        onChange={handleChange}
        items={navigationItems}
      />
    </MetadataContext.Provider>
  );
};
