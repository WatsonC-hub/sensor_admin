import React from 'react';
import {useParams} from 'react-router-dom';
import BearingGraph from 'src/pages/field/Station/BearingGraph';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import QAGraph from './QAGraph';
import useFormData from '../../../hooks/useFormData';

const QualityAssurance = () => {
  let params = useParams();

  return <QAGraph stationId={params.ts_id} measurements={[]} dynamicMeasurement={[]} />;
};

export default QualityAssurance;
