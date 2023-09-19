import React from 'react';
import {useParams} from 'react-router-dom';
import QAGraph from './QAGraph';
import Algorithms from './Algorithms';
import {Grid, Typography, Box, Button} from '@mui/material';
import QAHistory from './QAHistory';

const QualityAssurance = () => {
  let params = useParams();

  return (
    <Box m={1}>
      <QAGraph stationId={params.ts_id} measurements={[]} />

      <Grid container>
        <Grid item xs={12} sm={6}>
          <QAHistory />
        </Grid>
        <Grid item xs={12} sm={6}>
          <Algorithms />
        </Grid>
      </Grid>
    </Box>
  );
};

export default QualityAssurance;
