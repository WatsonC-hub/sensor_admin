import {Box, Grid, Tab, Tabs, Typography} from '@mui/material';
import React, {useState} from 'react';
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
  const [initiateSelect, setInitiateSelect] = useState(false);
  const [levelCorrection, setLevelCorrection] = useState(false);

  const {data} = useMetadata(params.ts_id);

  const handleChange = (_, newValue) => {
    setTabValue(newValue);
  };

  return (
    <MetadataContext.Provider value={data}>
      <NavBar />
      <Box m={1}>
        <Grid container>
          <Grid item xs={12} md={10}>
            <QAGraph
              stationId={params.ts_id}
              initiateSelect={initiateSelect}
              setInitiateSelect={setInitiateSelect}
              levelCorrection={levelCorrection}
              setLevelCorrection={setLevelCorrection}
            />
          </Grid>

          {!isTouch && (
            <>
              <Grid item xs={12} sm={2} pl={1}>
                <DataToShow />
                {/* <AnnotationConfiguration stationId={params.ts_id} /> */}
              </Grid>

              <Grid item xs={12} md={6}>
                <Box mx={1} display="flex" gap={1}>
                  <Typography alignSelf={'center'} variant="h6">
                    Detektionsalgoritmer
                  </Typography>
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
              scrollButtons="auto"
            >
              <Tab label="Vis data" />
              <Tab label="Datajustering" />
              <Tab label="Wizard" />
              <Tab label="Detektion" />
            </Tabs>
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
          </>
        )}
      </Box>
    </MetadataContext.Provider>
  );
};

export default QualityAssurance;
