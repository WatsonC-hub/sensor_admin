import React from 'react';
import {useParams} from 'react-router-dom';
import BearingGraph from 'src/pages/field/Station/BearingGraph';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import QAGraph from './QAGraph';
import useFormData from '../../../hooks/useFormData';
import GraphForms from './GraphForms';
import moment from 'moment';
import Algorithms from './Algorithms';
import {Grid, Typography, Box} from '@mui/material';

const QualityAssurance = () => {
  let params = useParams();

  return (
    <Box m={1}>
      <QAGraph stationId={params.ts_id} measurements={[]} />
      <Grid container>
        <Grid item xs={12} sm={6}>
          <Algorithms />
        </Grid>
      </Grid>
    </Box>
  );
};

export default QualityAssurance;
