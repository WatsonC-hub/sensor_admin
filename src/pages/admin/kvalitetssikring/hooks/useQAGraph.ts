import {useTheme} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {useAtomValue} from 'jotai';
import moment from 'moment';
import {useMemo} from 'react';

import {apiClient} from '~/apiClient';
import {correction_map} from '~/consts';
import {useCertifyQa} from '~/features/kvalitetssikring/api/useCertifyQa';
import {useAdjustmentData} from '~/hooks/query/useAdjustmentData';
import {useControlData} from '~/hooks/query/useControlData';
import {useEdgeDates} from '~/hooks/query/useEdgeDates';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {dataToShowAtom} from '~/state/atoms';
import {QaGraphLabel} from '~/types';

const useQAGraph = () => {
  const {data: timeseries_data} = useTimeseriesData();
  const dataToShow = useAtomValue(dataToShowAtom);
  const theme = useTheme();
  const loc_name = timeseries_data?.loc_name;
  const ts_name = timeseries_data?.ts_name;

  const data = [
    {
      x: graphData?.x,
      y: graphData?.y,
      name: loc_name + ' ' + ts_name,
      type: 'scattergl',
      line: {width: 2},
      mode: 'lines+markers',
      marker: {symbol: '100', size: '3', color: '#177FC1'},
    },
    ...(dataToShow?.Kontrolmålinger
      ? [
          {
            x: xControl,
            y: yControl,
            name: 'Kontrolpejlinger',
            type: 'scattergl',
            mode: 'markers',
            text: textControl,
            marker: {
              symbol: '200',
              size: '8',
              color: '#177FC1',
              line: {color: 'rgb(0,0,0)', width: 1},
            },
          },
        ]
      : []),
    ...(dataToShow?.['Fjernet data']
      ? [
          {
            x: removed_data?.timeofmeas,
            y: removed_data?.measurement,
            text: removed_data?.label,
            name: 'Fjernet data',
            type: 'scattergl',
            line: {width: 2},
            mode: 'markers',
            marker: {symbol: '100', size: '3', color: theme.palette.error.main},
          },
        ]
      : []),
    ...(dataToShow?.['Nedbør']
      ? [
          {
            ...precipitation_data?.trace,
            ...precipitation_data?.data,
            yaxis: 'y2',
          },
        ]
      : []),
  ];

  return {data, graphData, shapes, annotations};
};

export default useQAGraph;
