import {Box, Grid, Tab, Tabs, Typography} from '@mui/material';
import React, {ReactNode, SyntheticEvent, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import NavBar from '~/components/NavBar';
import StepWizard from '~/features/kvalitetssikring/wizard/StepWizard';
import {useMetadata} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import Algorithms from '~/pages/admin/kvalitetssikring/Algorithms';
import DataToShow from '~/pages/admin/kvalitetssikring/components/DataToShow';
import QAGraph from '~/pages/admin/kvalitetssikring/QAGraph';
import QAHistory from '~/pages/admin/kvalitetssikring/QAHistory';
import {MetadataContext} from '~/state/contexts';

interface TabPanelProps {
  children: ReactNode;
  value: number;
  index: number;
}

function TabPanel({children, value, index, ...other}: TabPanelProps) {
  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && <Box p={2}>{children}</Box>}
    </div>
  );
}

const QualityAssurance = () => {
  const params = useParams();

  const {isTouch, isMobile} = useBreakpoints();
  const [tabValue, setTabValue] = React.useState(0);
  const [initiateSelect, setInitiateSelect] = useState(false);
  const [levelCorrection, setLevelCorrection] = useState(false);

  const {data} = useMetadata(params.ts_id ? parseInt(params.ts_id) : -1);

  const handleChange = (e: SyntheticEvent, newValue: number) => {
    setTabValue(newValue);
  };

  useEffect(() => {
    setTabValue(0);
  }, [isTouch]);

  if (!isMobile) {
    return (
      <Layout
        data={data}
        ts_id={params.ts_id ? parseInt(params.ts_id) : -1}
        initiateSelect={initiateSelect}
        setInitiateSelect={setInitiateSelect}
        levelCorrection={levelCorrection}
        setLevelCorrection={setLevelCorrection}
      >
        <Grid item tablet={1}>
          <DataToShow />
        </Grid>
        <Box boxShadow={2} borderRadius={4} m={'auto'} width={'100%'} maxWidth={1200}>
          <Tabs
            value={tabValue}
            onChange={handleChange}
            variant="fullWidth"
            aria-label="simple tabs example"
            scrollButtons="auto"
          >
            <Tab label="Data" />
            <Tab label="Algoritmer" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <Box display={'flex'} flexDirection={'row'}>
              <Grid container gap={isTouch ? 2 : 0}>
                <Grid item tablet={12} laptop={6} desktop={6} xl={6}>
                  <Box mr={1} display={'flex'} flexDirection={'column'} gap={1}>
                    <Typography variant="h5">Datajustering</Typography>
                    <StepWizard
                      setInitiateSelect={setInitiateSelect}
                      setLevelCorrection={setLevelCorrection}
                    />
                  </Box>
                </Grid>
                <Grid item tablet={12} laptop={6} desktop={6} xl={6}>
                  <Box display={'flex'} flexDirection={'column'} borderRadius={4}>
                    <Typography variant="h5">Aktive justeringer</Typography>
                    <QAHistory />
                  </Box>
                </Grid>
              </Grid>
            </Box>
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Grid tablet={12} direction={'column'}>
              <Algorithms />
            </Grid>{' '}
          </TabPanel>
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
      setLevelCorrection={setLevelCorrection}
    >
      <Box boxShadow={4} borderRadius={4} width={'100%'} m={'auto'} maxWidth={1200}>
        <Tabs
          value={tabValue}
          onChange={handleChange}
          variant={'fullWidth'}
          aria-label="simple tabs example"
          scrollButtons="auto"
        >
          <Tab label="Data" />
          <Tab label="Justering" />
          <Tab label="Wizard" />
          <Tab label="Detektion" />
        </Tabs>

        <Grid item mobile={12}>
          <TabPanel value={tabValue} index={0}>
            <DataToShow />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <QAHistory />
          </TabPanel>
          <TabPanel value={tabValue} index={2}>
            <StepWizard
              setInitiateSelect={setInitiateSelect}
              setLevelCorrection={setLevelCorrection}
            />
          </TabPanel>
          <TabPanel value={tabValue} index={3}>
            <Algorithms />
          </TabPanel>
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
  setLevelCorrection: (value: boolean) => void;
  children: ReactNode;
}

const Layout = ({
  data,
  ts_id,
  initiateSelect,
  setInitiateSelect,
  levelCorrection,
  setLevelCorrection,
  children,
}: LayoutProps) => {
  return (
    <MetadataContext.Provider value={data}>
      <NavBar />
      <Grid container gap={1}>
        <Grid item mobile={12} tablet={9} laptop={10}>
          <QAGraph
            stationId={ts_id}
            initiateSelect={initiateSelect}
            setInitiateSelect={setInitiateSelect}
            levelCorrection={levelCorrection}
            setLevelCorrection={setLevelCorrection}
          />
        </Grid>
        {children}
      </Grid>
    </MetadataContext.Provider>
  );
};
