import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {Layout} from 'plotly.js';
import {useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {correction_map, setGraphHeight} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import {stamdataStore} from '~/state/store';
import {PejlingItem} from '~/types';

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

interface PlotGraphProps {
  ts_id: number;
  controlData: Array<PejlingItem & {waterlevel: number | null}>;
  dynamicMeasurement: Record<string, number>;
}

function PlotGraph({ts_id, controlData, dynamicMeasurement}: PlotGraphProps) {
  const [name, unit, stationtype] = stamdataStore((state) => [
    state.location.loc_name + ' ' + state.timeseries.ts_name,
    state.timeseries.unit,
    state.timeseries.tstype_name,
  ]);
  const {isTouch} = useBreakpoints();
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
        yaxis: {
          title: `${stationtype} [${unit}]`,
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

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.waterlevel);
  const textControl = controlData?.map((d) => correction_map[d.useforcorrection]);

  const data = [
    {
      x: graphData?.x,
      y: graphData?.y,
      name: name,
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
      x: [dynamicMeasurement?.[0]],
      y: [dynamicMeasurement?.[1]],
      name: '',
      type: 'scatter',
      mode: 'markers',
      showlegend: false,
      marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
    },
  ];

  return (
    <PlotlyGraph
      plotModebarButtons={['link', 'raw', 'rerun', 'download']}
      layout={layout}
      data={data}
      setXRange={setXRange}
      showRaw={() => {
        fetchRaw();
        setShowRawData(true);
      }}
    />
  );
}

interface BearingGraphProps {
  stationId: number;
  dynamicMeasurement: Record<string, number>;
}

export default function BearingGraph({stationId, dynamicMeasurement}: BearingGraphProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [control, setControl] = useState<Array<PejlingItem & {waterlevel: number | null}>>();

  const {
    get: {data: watlevmp},
  } = useMaalepunkt();
  const {
    get: {data: measurements},
  } = usePejling();

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
    setControl(ctrls);
  }, [watlevmp, measurements]);

  return (
    <Box
      style={{
        height: setGraphHeight(matches),
      }}
    >
      <PlotGraph
        key={stationId}
        ts_id={stationId}
        controlData={control ? control : []}
        dynamicMeasurement={dynamicMeasurement}
      />
    </Box>
  );
}
