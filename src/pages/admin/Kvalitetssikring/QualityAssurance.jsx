import React from 'react';
import {useParams} from 'react-router-dom';
import QAGraph from './QAGraph';
import Algorithms from './Algorithms';
import {Grid, Typography, Box, Button, Tab, Tabs} from '@mui/material';
import QAHistory from './QAHistory';
import AnnotationConfiguration from './AnnotationConfiguration';
import useBreakpoints from 'src/hooks/useBreakpoints';

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

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const QualityAssurance = () => {
  const [tabValue, setTabValue] = React.useState(0);

  const handleChange = (_, newValue) => {
    setTabValue(newValue);
  };

  let params = useParams();

  const {isTouch} = useBreakpoints();

  return (
    <Box m={1}>
      <Grid container>
        <Grid item xs={12} md={10}>
          <QAGraph stationId={params.ts_id} measurements={[]} />
        </Grid>

        {!isTouch && (
          <>
            <Grid item xs={12} sm={2} pl={1}>
              <AnnotationConfiguration stationId={params.ts_id} />
            </Grid>
            <Grid item xs={12} sm={6}>
              <QAHistory />
            </Grid>
            <Grid item xs={12} md={6}>
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
            <Tab label="Annotering" />
            <Tab label="algoritmer" />
          </Tabs>
          <TabPanel value={tabValue} index={0}>
            <AnnotationConfiguration stationId={params.ts_id} />
          </TabPanel>
          <TabPanel value={tabValue} index={1}>
            <Algorithms />
          </TabPanel>
        </>
      )}
    </Box>
  );
};

export default QualityAssurance;
