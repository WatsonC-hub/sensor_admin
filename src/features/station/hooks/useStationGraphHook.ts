import {useQuery} from '@tanstack/react-query';
import {Layout, PlotData} from 'plotly.js';
import {useState} from 'react';

import {apiClient} from '~/apiClient';
import {correction_map} from '~/consts';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {PejlingItem} from '~/types';

const useStationGraphHook = (
  dynamicMeasurement: Array<string | number> | undefined,
  controlData: Array<PejlingItem & {waterlevel: number | null}> | undefined,
  xRange: Array<string>
) => {
  const {ts_id} = useAppContext(['ts_id']);

  const {data: timeseries_data} = useTimeseriesData();
  const loc_name = timeseries_data?.loc_name;
  const ts_name = timeseries_data?.ts_name;
  let data: Array<Partial<PlotData>> = [];

  const {isTouch} = useBreakpoints();

  const [showRawData, setShowRawData] = useState(false);
  const layout: Partial<Layout> = isTouch
    ? {
        yaxis2: {
          visible: false,
        },
      }
    : {
        yaxis2: {
          visible: false,
        },
      };

  const {data: graphData} = useGraphData(ts_id, xRange);

  const {data: rawData, refetch: fetchRaw} = useQuery({
    queryKey: ['rawdata', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/rawdata/${ts_id}`);
      if (data === null) {
        return [];
      }
      return data;
    },
    enabled: false,
    placeholderData: [],
  });

  if (controlData) {
    const xControl = controlData.map((d) => d.timeofmeas);
    const yControl = controlData.map((d) => d.waterlevel);
    const textControl = controlData.map((d) => correction_map[d.useforcorrection]);

    data = [
      {
        x: graphData?.x,
        y: graphData?.y,
        name: loc_name + ' ' + ts_name,
        type: 'scatter',
        line: {width: 2},
        mode: 'lines',
        marker: {symbol: '100', size: 3, color: '#177FC1'},
      },
      {
        x: showRawData ? rawData?.x : [],
        y: showRawData ? rawData?.y : [],
        name: 'Rådata',
        type: 'scattergl',
        yaxis: 'y2',
        line: {width: 2},
        mode: 'lines',
        marker: {symbol: '100', size: 3},
      },
      {
        x: xControl,
        y: yControl,
        name: 'Kontrolpejlinger',
        type: 'scatter',
        mode: 'markers',
        text: textControl,
        marker: {
          symbol: '200',
          size: 8,
          color: '#177FC1',
          line: {color: 'rgb(0,0,0)', width: 1},
        },
      },
      {
        x: dynamicMeasurement ? [dynamicMeasurement?.[0]] : [],
        y: dynamicMeasurement ? [dynamicMeasurement?.[1]] : [],
        name: '',
        uid: 'dynamic',
        type: 'scatter',
        mode: 'markers',
        showlegend: false,
        marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
      },
    ];
  }
  return {layout, data, fetchRaw, setShowRawData};
};

export default useStationGraphHook;
