import {Box, Grid, Tab, Tabs, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useAtom} from 'jotai';
import React from 'react';
import {useParams} from 'react-router-dom';
import NavBar from 'src/NavBar';
import {apiClient} from 'src/apiClient';
import useBreakpoints from 'src/hooks/useBreakpoints';
import {nonRerunChangesAtom} from 'src/state/atoms';
import {MetadataContext} from 'src/state/contexts';
import Algorithms from './Algorithms';
import QAGraph from './QAGraph';
import QAHistory from './QAHistory';
import DataToShow from './components/DataToShow';
import HandleNowButton from './components/HandleNowButton';

function TabPanel(props) {
  const {children, value, index, ...other} = props;

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
  let params = useParams();

  const {isTouch} = useBreakpoints();
  const [tabValue, setTabValue] = React.useState(0);
  const [nonRerunChanges, setNonRerunChanges] = useAtom(nonRerunChangesAtom);

  const {data} = useQuery(
    ['metadata', params.ts_id],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata/${params.ts_id}`);
      return data;
    },
    {
      enabled: params.ts_id !== undefined,
      refetchInterval: null,
      refetchIntervalInBackground: false,
      refetchOnWindowFocus: false,
      refetchOnMount: false,
    }
  );

  const handleChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <MetadataContext.Provider value={data}>
      <NavBar />
      <Box m={1}>
        <Grid container>
          <Grid item xs={12} md={10}>
            <QAGraph stationId={params.ts_id} />
          </Grid>

          {!isTouch && (
            <>
              <Grid item xs={12} sm={2} pl={1}>
                {/* <AnnotationConfiguration stationId={params.ts_id} /> */}
                <DataToShow />
              </Grid>
              <Grid item xs={12} sm={6} pr={1}>
                <Typography variant="h6">Datajusteringer</Typography>
                <QAHistory />
              </Grid>
              <Grid item xs={12} md={6}>
                <Box display="flex" gap={1}>
                  <Typography variant="h6">Detektionsalgoritmer</Typography>
                  <HandleNowButton />
                </Box>
                <Algorithms />
              </Grid>
            </>
          )}
        </Grid>

        {isTouch && (
          <>
            <Tabs
              value={tabValue}
              onChange={handleChange}
              variant="fullWidth"
              aria-label="simple tabs example"
            >
              <Tab label="Vis data" />
              <Tab label="Datajustering" />
              <Tab label="Detektion" />
            </Tabs>
            <TabPanel value={tabValue} index={0}>
              <DataToShow />
            </TabPanel>
            <TabPanel value={tabValue} index={1}>
              <QAHistory />
            </TabPanel>

            <TabPanel value={tabValue} index={2}>
              <HandleNowButton />
              <Algorithms />
            </TabPanel>
          </>
        )}
      </Box>
    </MetadataContext.Provider>
  );
};

export default QualityAssurance;
