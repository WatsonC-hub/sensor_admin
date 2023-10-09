import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import moment from 'moment';
import {useState, useEffect, useRef} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {stamdataStore} from '../../../state/store';
import {apiClient} from 'src/apiClient';
import {toast} from 'react-toastify';
import {downloadIcon, rerunIcon, rawDataIcon, makeLinkIcon} from 'src/helpers/plotlyIcons';
import {useCorrectData} from 'src/hooks/useCorrectData';
import {useGraphData} from 'src/hooks/query/useGraphData';

const selectorOptions = {
  buttons: [
    {
      step: 'day',
      stepmode: 'backward',
      count: 7,
      label: '1 uge',
    },
    {
      step: 'month',
      stepmode: 'backward',
      count: 1,
      label: '1 måned',
    },
    {
      step: 'year',
      stepmode: 'backward',
      count: 1,
      label: '1 år',
    },

    {
      step: 'all',
      label: 'Alt',
    },
  ],
};

const desktopLayout = {
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: 'date',
    showline: true,
    domain: [0, 0.97],
  },
  yaxis: {
    title: {
      text: '',
      font: {size: 12},
    },
    showline: true,
    autorange: false,
    autornage: false,
  },
  yaxis2: {
    showgrid: false,
    overlaying: 'y',
    side: 'right',
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

  showlegend: true,
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
  },
  margin: {
    // l: 70,
    r: 0,
    // b: 30,
    t: 10,
    pad: 4,
  },
  font: {
    size: 12,
    color: 'rgb(0, 0, 0)',
  },
};

const mobileLayout = {
  modebar: {
    orientation: 'v',
  },
  //autosize: true,
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: 'date',
    margin: {
      t: 0,
    },
    domain: [0, 0.97],
  },

  yaxis: {
    autorange: false,
    showline: true,
    y: 1,
    title: {
      text: '',
      font: {size: 12},
    },
  },
  yaxis2: {
    autorange: false,
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
  legend: {
    x: 0,
    y: -0.15,
    orientation: 'h',
  },
  margin: {
    l: 50,
    r: 30,
    b: 40,
    t: 0,
    pad: 4,
  },
  font: {
    size: 12,
    color: 'rgb(0, 0, 0)',
  },
};

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

function PlotGraph({ts_id, controlData, dynamicMeasurement}) {
  const [name, unit, stationtype, terrainlevel] = stamdataStore((state) => [
    state.location.loc_name + ' ' + state.timeseries.ts_name,
    state.timeseries.unit,
    state.timeseries.tstype_name,
    state.location.terrainlevel,
  ]);

  // const toastId = useRef(null);

  const queryClient = useQueryClient();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [xRange, setXRange] = useState(initRange);
  const [layout, setLayout] = useState(
    matches ? structuredClone(mobileLayout) : structuredClone(desktopLayout)
  );

  useEffect(() => {
    refetchData([ts_id, initRange]);
  }, [ts_id]);

  const handleRelayout = (e) => {
    console.log(e);
    if (e['xaxis.autorange'] == true || e['autosize'] == true) {
      setXRange(initRange);
      return;
    }

    if (e['dragmode']) {
      setLayout((prev) => {
        return {
          ...prev,
          dragmode: e['dragmode'],
        };
      });
    }

    if (e['xaxis.range[0]'] !== undefined) {
      let x0 = moment(e['xaxis.range[0]']);
      let x1 = moment(e['xaxis.range[1]']);

      const daysdiff = x1.diff(x0, 'days');

      x0 = x0.subtract(daysdiff * 0.2, 'days');
      x1 = x1.add(daysdiff * 0.2, 'days');

      setXRange([x0.format('YYYY-MM-DDTHH:mm'), x1.format('YYYY-MM-DDTHH:mm')]);
      return;
    }
  };

  const {data: graphData, refetch: refetchData} = useGraphData(ts_id, xRange);

  const {data: rawData, refetch: fetchRaw} = useQuery(
    ['rawdata', ts_id],
    async ({signal}) => {
      const {data} = await apiClient.get(`/sensor_field/station/rawdata/${ts_id}`);
      if (data === null) {
        return [];
      }
      return data;
    },
    {
      enabled: false,
      placeholderData: [],
    }
  );

  const {mutation: correctMutation} = useCorrectData(ts_id, 'graphData');

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.waterlevel);
  // const stationtype = graphData?.[0] ? graphData[0].properties.parameter : "";

  var downloadButton = {
    name: 'Download data',
    icon: downloadIcon,
    click: function (gd) {
      console.log(gd);
      // var rows = gd.data[0].x.map((elem, idx) => [
      //   moment(elem).format('YYYY-MM-DD HH:mm'),
      //   gd.data[0].y[idx].toString().replace('.', ','),
      // ]);

      // exportToCsv('data.csv', rows);
    },
  };

  var rerunButton = {
    name: 'Genberegn data',
    icon: rerunIcon,
    click: function (gd) {
      // toastId.current = toast.loading('Genberegner...');
      correctMutation.mutate({});
    },
  };

  var getRawData = {
    name: 'Hent rådata',
    icon: rawDataIcon,
    click: function (gd) {
      fetchRaw();
      gd.layout = {
        ...gd.layout,
        yaxis2: {
          ...gd.layout.yaxis2,
          visible: true,
        },
      };
      setLayout(gd.layout);
    },
  };

  var makeLinkButton = {
    name: 'Ekstern link',
    icon: makeLinkIcon,
    click: function (gd) {
      var ts_id = window.location.href.split('/').at(-1).split('#').at(0);

      var link = document.createElement('a');
      if (link.download !== undefined) {
        // feature detection
        // Browsers that support HTML5 download attribute
        var url =
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
    <Plot
      // key={ts_id}
      id={`graph_${ts_id}`}
      divId={`graph_${ts_id}`}
      data={[
        {
          x: graphData?.x,
          y: graphData?.y,
          name: name,
          type: 'scattergl',
          line: {width: 2},
          mode: 'lines',
          marker: {symbol: '100', size: '3', color: '#177FC1'},
        },
        {
          x: rawData?.x,
          y: rawData?.y,
          name: 'Rådata',
          type: 'scattergl',
          yaxis: 'y2',
          line: {width: 2},
          mode: 'lines',
          marker: {symbol: '100', size: '3'},
        },
        {
          x: xControl,
          y: yControl,
          name: 'Kontrolpejlinger',
          type: 'scatter',
          mode: 'markers',
          marker: {
            symbol: '200',
            size: '8',
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
          marker: {symbol: '50', size: '8', color: 'rgb(0,120,109)'},
        },
      ]}
      layout={{
        ...layout,
        uirevision: 'true',
        yaxis: {
          title: `${stationtype} [${unit}]`,
        },
      }}
      config={{
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
      // onDoubleClick={() => setXRange(initRange)}
    />
  );
}

export default function BearingGraph({stationId, measurements, dynamicMeasurement}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div
      style={{
        width: 'auto',
        height: matches ? '300px' : '500px',
        // marginBottom: '10px',
        paddingTop: '5px',
        border: '2px solid gray',
      }}
    >
      <PlotGraph
        key={stationId}
        ts_id={stationId}
        controlData={measurements}
        dynamicMeasurement={dynamicMeasurement}
      />
    </div>
  );
}
