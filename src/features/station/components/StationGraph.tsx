import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {Layout, PlotData} from 'plotly.js';
import {useContext, useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {correction_map, setGraphHeight} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import {MetadataContext} from '~/state/contexts';
import {PejlingItem} from '~/types';

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

interface PlotGraphProps {
  ts_id: number;
  dynamicMeasurement: Array<string | number> | undefined;
}

export default function PlotGraph({ts_id, dynamicMeasurement}: PlotGraphProps) {
  const metadata = useContext(MetadataContext);
  const loc_name = metadata?.loc_name;
  const ts_name = metadata?.ts_name;

  const {isTouch, isMobile} = useBreakpoints();
  const [xRange, setXRange] = useState(initRange);

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
  const [controlData, setControlData] =
    useState<Array<PejlingItem & {waterlevel: number | null}>>();

  const {
    get: {data: watlevmp},
  } = useMaalepunkt();
  const {
    get: {data: measurements},
  } = usePejling();

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

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.waterlevel);
  const textControl = controlData?.map((d) => correction_map[d.useforcorrection]);

  const data: Array<Partial<PlotData>> = [
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

  useEffect(() => {
    let ctrls: Array<PejlingItem & {waterlevel: number | null}> = [];
    if (measurements && watlevmp && watlevmp.length > 0) {
      ctrls = measurements.map((e) => {
        const elev = watlevmp.filter((e2) => {
          return e.timeofmeas >= e2.startdate && e.timeofmeas < e2.enddate;
        })[0]?.elevation;
        return {
          ...e,
          waterlevel: e.measurement != null ? elev - e.measurement : null,
        };
      });
    } else if (measurements) {
      ctrls = measurements.map((elem) => {
        return {...elem, waterlevel: elem.measurement};
      });
    }
    setControlData(ctrls);
  }, [watlevmp, measurements]);

  useEffect(() => {
    if (dynamicMeasurement?.[0] != undefined) {
      setXRange([
        moment(dynamicMeasurement?.[0]).subtract(4, 'day').format('YYYY-MM-DD'),
        moment(dynamicMeasurement?.[0]).add(3, 'day').format('YYYY-MM-DD'),
      ]);
    }
  }, [dynamicMeasurement?.[0]]);

  return (
    <Box
      style={{
        height: setGraphHeight(isMobile),
      }}
    >
      <PlotlyGraph
        plotModebarButtons={['link', 'raw', 'rerun', 'download']}
        layout={layout}
        data={data}
        xRange={xRange}
        setXRange={setXRange}
        showRaw={() => {
          fetchRaw();
          setShowRawData(true);
        }}
      />
    </Box>
  );
}
