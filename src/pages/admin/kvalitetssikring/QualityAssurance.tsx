import {Delete, Verified} from '@mui/icons-material';
import DensityLargeIcon from '@mui/icons-material/DensityLarge';
import FunctionsIcon from '@mui/icons-material/Functions';
import HighlightAltIcon from '@mui/icons-material/HighlightAlt';
import QueryStatsIcon from '@mui/icons-material/QueryStats';
import {Box, Divider, Grid, Typography} from '@mui/material';
import {useSetAtom} from 'jotai';
import {startCase} from 'lodash';
import React, {ReactNode, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import CustomBottomNavigation from '~/components/BottomNavigation';
import NavBar from '~/components/NavBar';
import SpeedDialWrapper from '~/components/SpeedDialWrapper';
import StepWizard from '~/features/kvalitetssikring/wizard/StepWizard';
import {QaAdjustment, QaPages} from '~/helpers/EnumHelper';
import {useMetadata} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useSearchParam} from '~/hooks/useSeachParam';
import Algorithms from '~/pages/admin/kvalitetssikring/Algorithms';
import DataToShow from '~/pages/admin/kvalitetssikring/components/DataToShow';
import QAHistory from '~/pages/admin/kvalitetssikring/QAHistory';
import {MetadataContext} from '~/state/contexts';
import {DialAction} from '~/types';

import PlotGraph from './QAGraph';

const navIconStyle = (isSelected: boolean) => {
  return isSelected ? 'secondary.main' : 'inherit';
};

const QualityAssurance = () => {
  const params = useParams();
  const [pageToShow] = useSearchParam('page');
  const [dataAdjustment, setDataAdjustment] = useSearchParam('adjust', null);

  const {isMobile} = useBreakpoints();
  const [initiateSelect, setInitiateSelect] = useState(false);
  const [levelCorrection, setLevelCorrection] = useState(false);
  const [initiateConfirmTimeseries, setInitiateConfirmTimeseries] = useState(false);

  const {data} = useMetadata(params.ts_id ? parseInt(params.ts_id) : -1);

  const speedDialActions: Array<DialAction> = [];

  useEffect(() => {
    if (pageToShow !== QaPages.DATA) {
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
        setDataAdjustment(QaAdjustment.CONFIRM);
      },
      color: navIconStyle(dataAdjustment === QaAdjustment.CONFIRM),
    },
    {
      key: 'removeData',
      icon: <Delete />,
      tooltip: <Typography noWrap>Fjern data</Typography>,
      onClick: () => {
        setInitiateSelect(true);
        setDataAdjustment(QaAdjustment.REMOVE);
      },
      color: navIconStyle(dataAdjustment === QaAdjustment.REMOVE),
    },
    {
      key: 'defineValues',
      icon: <DensityLargeIcon />,
      tooltip: <Typography noWrap>Definer værdier</Typography>,
      onClick: () => {
        setInitiateSelect(true);
        setDataAdjustment(QaAdjustment.BOUNDS);
      },
      color: navIconStyle(dataAdjustment === QaAdjustment.BOUNDS),
    },
    {
      key: 'levelCorrection',
      icon: <HighlightAltIcon />,
      tooltip: <Typography noWrap>Korriger spring</Typography>,
      onClick: () => {
        setLevelCorrection(true);
        setDataAdjustment(QaAdjustment.CORRECTION);
      },
      color: navIconStyle(dataAdjustment === QaAdjustment.CORRECTION),
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
            {pageToShow === QaPages.DATA && (
              <>
                <Grid container gap={3} justifyContent={'center'}>
                  <Grid item tablet={12} laptop={7} desktop={7} xl={7}>
                    {dataAdjustment !== null && (
                      <Box mr={1} display={'flex'} flexDirection={'column'} gap={1}>
                        <Typography variant="h5">Datajustering</Typography>
                        <StepWizard
                          setLevelCorrection={setLevelCorrection}
                          initiateConfirmTimeseries={initiateConfirmTimeseries}
                          setInitiateSelect={setInitiateSelect}
                          setInitiateConfirmTimeseries={setInitiateConfirmTimeseries}
                        />
                      </Box>
                    )}
                  </Grid>
                  <Grid item tablet={12} laptop={7} desktop={7} xl={7}>
                    <Box display={'flex'} flexDirection={'column'} borderRadius={4}>
                      <Typography variant="h5">Aktive justeringer</Typography>
                      <QAHistory />
                    </Box>
                  </Grid>
                </Grid>
                <SpeedDialWrapper actions={speedDialActions} />
              </>
            )}
            {pageToShow === QaPages.ALGORITHMS && <Algorithms />}
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
          {pageToShow === QaPages.DATA && (
            <>
              {dataAdjustment !== null && (
                <StepWizard
                  setLevelCorrection={setLevelCorrection}
                  initiateConfirmTimeseries={initiateConfirmTimeseries}
                  setInitiateSelect={setInitiateSelect}
                  setInitiateConfirmTimeseries={setInitiateConfirmTimeseries}
                />
              )}
              <QAHistory />
              <SpeedDialWrapper actions={speedDialActions} />
            </>
          )}
          {pageToShow === QaPages.ALGORITHMS && <Algorithms />}
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

  const navigationItems = [];

  navigationItems.push(
    {
      text: 'Justering',
      value: QaPages.DATA,
      icon: <QueryStatsIcon />,
      color: navIconStyle(pageToShow === QaPages.DATA),
    },
    {
      text: startCase(QaPages.ALGORITHMS),
      value: QaPages.ALGORITHMS,
      icon: <FunctionsIcon />,
      color: navIconStyle(pageToShow === QaPages.ALGORITHMS),
    }
  );

  return (
    <MetadataContext.Provider value={data}>
      <NavBar />
      {isMobile && <DataToShow />}

      <Grid container gap={1}>
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
