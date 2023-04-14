import React from 'react';
import {useParams} from 'react-router-dom';
import BearingGraph from 'src/pages/field/Station/BearingGraph';
import {useQuery} from '@tanstack/react-query';
import {apiClient} from 'src/apiClient';
import QAGraph from './QAGraph';
import useFormData from '../../../hooks/useFormData';
import GraphForms from './GraphForms';
import moment from 'moment';

const QualityAssurance = () => {
  let params = useParams();

  const handleClick = (e) => {
    var gd = document.getElementById('graph');

    gd?.addEventListener('mousemove', function (evt) {
      var bb = evt.target.getBoundingClientRect();
      var x = gd._fullLayout.xaxis.p2d(evt.clientX - bb.left);
      var y = gd._fullLayout.yaxis.p2d(evt.clientY - bb.top);
      console.log(x, y);
    });
  };
  return (
    <>
      <QAGraph stationId={params.ts_id} measurements={[]} />
      <button onClick={handleClick}>Click</button>
    </>
  );
};

export default QualityAssurance;
