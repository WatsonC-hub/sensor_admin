import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {Layout} from 'plotly.js';
import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';

import {apiClient} from '~/apiClient';
import {correction_map, setGraphHeight} from '~/consts';
import usePlotlyLayout from '~/features/kvalitetssikring/components/usePlotlyLayout';
import {usePejling} from '~/features/pejling/api/usePejling';
import {MergeType} from '~/helpers/EnumHelper';
import {downloadIcon, makeLinkIcon, rawDataIcon, rerunIcon} from '~/helpers/plotlyIcons';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {useCorrectData} from '~/hooks/useCorrectData';
import {stamdataStore} from '~/state/store';
import {PejlingItem} from '~/types';

// const initRange = [
//   moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
//   moment().format('YYYY-MM-DDTHH:mm'),
// ];

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

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [xRange, setXRange] = useState([
    moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
    moment().format('YYYY-MM-DDTHH:mm'),
  ]);

  const [showRawData, setShowRawData] = useState(false);
  const layout: Partial<Layout> = matches
    ? {
        xaxis: {
          domain: [0, 0.97],
        },
        yaxis2: {
          showgrid: false,
          overlaying: 'y',
          side: 'right',
          position: 0.9,
          anchor: 'x',
          visible: false,
          title: {
            font: {
              size: 12,
            },
          },
        },
        showlegend: false,
      }
    : {
        xaxis: {
          domain: [0, 0.97],
        },
        yaxis2: {
          position: 0.9,
          anchor: 'x',
          visible: false,
          title: {
            text: '',
            font: {
              size: 12,
            },
          },
        },
      };
  const [mergedLayout, setLayout] = usePlotlyLayout(MergeType.RECURSIVEMERGE, layout);

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

  const {mutation: correctMutation} = useCorrectData(ts_id, 'graphData');

  const handleRelayout = (e: any) => {
    if (e['xaxis.autorange'] == true || e['autosize'] == true) {
      setXRange([
        moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
        moment().format('YYYY-MM-DDTHH:mm'),
      ]);
      return;
    }

    if (e['dragmode']) {
      setLayout({dragmode: e['dragmode']});
    }

    if (e['xaxis.range[0]'] !== undefined) {
      let x0 = moment(e['xaxis.range[0]']);
      let x1 = moment(e['xaxis.range[1]']);

      const daysdiff = x1.diff(x0, 'days');

      x0 = x0.subtract(Math.max(daysdiff * 0.2, 1), 'days');
      x1 = x1.add(Math.max(daysdiff * 0.2, 1), 'days');

      setXRange([x0.format('YYYY-MM-DDTHH:mm'), x1.format('YYYY-MM-DDTHH:mm')]);
      return;
    }
  };

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.waterlevel);
  const textControl = controlData?.map((d) => correction_map[d.useforcorrection]);
  // const stationtype = graphData?.[0] ? graphData[0].properties.parameter : "";

  const downloadButton = {
    title: 'Download data',
    name: 'Download data',
    icon: downloadIcon,
    click: function (gd: any) {
      console.log(gd);
      // var rows = gd.data[0].x.map((elem, idx) => [
      //   moment(elem).format('YYYY-MM-DD HH:mm'),
      //   gd.data[0].y[idx].toString().replace('.', ','),
      // ]);

      // exportToCsv('data.csv', rows);
    },
  };

  const rerunButton = {
    title: 'Genberegn data',
    name: 'Genberegn data',
    icon: rerunIcon,
    click: function () {
      // toastId.current = toast.loading('Genberegner...');
      correctMutation.mutate();
    },
  };

  const getRawData = {
    title: 'Hent rå data',
    name: 'Hent rådata',
    icon: rawDataIcon,
    click: function (gd: any) {
      fetchRaw();
      gd.layout = {
        ...gd.layout,
        yaxis2: {
          ...gd.layout.yaxis2,
          visible: true,
        },
      };
      setShowRawData(true);
      setLayout(gd.layout);
    },
  };

  const makeLinkButton = {
    title: 'Ekstern data',
    name: 'Ekstern link',
    icon: makeLinkIcon,
    click: function () {
      const ts_id = window.location.href.split('/').at(-1)?.split('#').at(0);

      const link = document.createElement('a');
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        const url =
          'https://watsonc.dk/calypso/timeseries_plot.html?&ts_id=' + ts_id + '&pejling=true';
        link.setAttribute('href', url);
        link.setAttribute('target', '_blank');
        link.style.visibility = 'hidden';
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }

      // exportToCsv("data.csv", rows);
    },
  };

  return (
    <>
      <Plot
        // key={ts_id}
        divId={`graph_${ts_id}`}
        data={[
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
        ]}
        layout={{
          ...mergedLayout,
          uirevision: 'true',
          yaxis: {
            title: `${stationtype} [${unit}]`,
          },
        }}
        config={{
          showTips: false,
          responsive: true,
          modeBarButtons: [
            [downloadButton, makeLinkButton, rerunButton, getRawData],
            ['zoom2d', 'pan2d', 'zoomIn2d', 'zoomOut2d', 'resetScale2d'],
          ],

          displaylogo: false,
          displayModeBar: true,
        }}
        useResizeHandler={true}
        style={{width: '99%', height: '100%'}}
        onRelayout={handleRelayout}
      />
    </>
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
    <div
      style={{
        height: setGraphHeight(matches),
        // marginBottom: '10px',
      }}
    >
      <PlotGraph
        key={stationId}
        ts_id={stationId}
        controlData={control ? control : []}
        dynamicMeasurement={dynamicMeasurement}
      />
    </div>
  );
}
