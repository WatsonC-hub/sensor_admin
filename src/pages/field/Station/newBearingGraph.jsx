import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import Plot from 'react-plotly.js';
import moment from 'moment';
import {useState, useEffect, useRef} from 'react';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import {stamdataStore} from '../../../state/store';
import {apiClient} from 'src/pages/field/fieldAPI';
import {toast} from 'react-toastify';

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

var downloadIcon = {
  width: 500,
  // viewBox: "0 0 60 55",
  path: 'M224 376V512H24C10.7 512 0 501.3 0 488v-464c0-13.3 10.7-24 24-24h336c13.3 0 24 10.7 24 24V352H248c-13.2 0-24 10.8-24 24zm76.45-211.36-96.42-95.7c-6.65-6.61-17.39-6.61-24.04 0l-96.42 95.7C73.42 174.71 80.54 192 94.82 192H160v80c0 8.84 7.16 16 16 16h32c8.84 0 16-7.16 16-16v-80h65.18c14.28 0 21.4-17.29 11.27-27.36zM377 407 279.1 505c-4.5 4.5-10.6 7-17 7H256v-128h128v6.1c0 6.3-2.5 12.4-7 16.9z',
  ascent: 500,
  descent: -50,
};

var makeLinkIcon = {
  width: 500,
  // viewBox: "0 0 60 55",
  path: 'M326.612 185.391c59.747 59.809 58.927 155.698.36 214.59-.11.12-.24.25-.36.37l-67.2 67.2c-59.27 59.27-155.699 59.262-214.96 0-59.27-59.26-59.27-155.7 0-214.96l37.106-37.106c9.84-9.84 26.786-3.3 27.294 10.606.648 17.722 3.826 35.527 9.69 52.721 1.986 5.822.567 12.262-3.783 16.612l-13.087 13.087c-28.026 28.026-28.905 73.66-1.155 101.96 28.024 28.579 74.086 28.749 102.325.51l67.2-67.19c28.191-28.191 28.073-73.757 0-101.83-3.701-3.694-7.429-6.564-10.341-8.569a16.037 16.037 0 0 1-6.947-12.606c-.396-10.567 3.348-21.456 11.698-29.806l21.054-21.055c5.521-5.521 14.182-6.199 20.584-1.731a152.482 152.482 0 0 1 20.522 17.197zM467.547 44.449c-59.261-59.262-155.69-59.27-214.96 0l-67.2 67.2c-.12.12-.25.25-.36.37-58.566 58.892-59.387 154.781.36 214.59a152.454 152.454 0 0 0 20.521 17.196c6.402 4.468 15.064 3.789 20.584-1.731l21.054-21.055c8.35-8.35 12.094-19.239 11.698-29.806a16.037 16.037 0 0 0-6.947-12.606c-2.912-2.005-6.64-4.875-10.341-8.569-28.073-28.073-28.191-73.639 0-101.83l67.2-67.19c28.239-28.239 74.3-28.069 102.325.51 27.75 28.3 26.872 73.934-1.155 101.96l-13.087 13.087c-4.35 4.35-5.769 10.79-3.783 16.612 5.864 17.194 9.042 34.999 9.69 52.721.509 13.906 17.454 20.446 27.294 10.606l37.106-37.106c59.271-59.259 59.271-155.699.001-214.959z',
  ascent: 500,
  descent: -50,
};

var rerunIcon = {
  width: 500,
  // viewBox: "0 0 60 55",
  path: 'M456.092 216.482a15 15 0 0 0-13.858-9.26H412.74C401.865 103.271 313.719 21.971 206.937 21.971 92.831 21.971 0 114.802 0 228.907c0 108.662 84.185 198.031 190.758 206.31a15.008 15.008 0 0 0 11.349-3.945 15.004 15.004 0 0 0 4.829-11.009v-70.358c0-7.582-5.64-13.94-13.166-14.868-52.776-6.507-93.77-51.621-93.77-106.13 0-58.965 47.972-106.937 106.937-106.937 51.538 0 94.676 36.648 104.726 85.252h-26.149a14.999 14.999 0 0 0-10.606 25.607l78.36 78.359a14.954 14.954 0 0 0 10.606 4.394c3.838 0 7.678-1.465 10.606-4.394l78.36-78.359a15.001 15.001 0 0 0 3.252-16.347z',
  ascent: 500,
  descent: -50,
};

var rawDataIcon = {
  width: 32,
  height: 32,
  viewBox: '0 0 32 32',
  path: 'M29.5 7c-1.381 0-2.5 1.12-2.5 2.5 0 0.284 0.058 0.551 0.144 0.805l-6.094 5.247c-0.427-0.341-0.961-0.553-1.55-0.553-0.68 0-1.294 0.273-1.744 0.713l-4.774-2.39c-0.093-1.296-1.162-2.323-2.482-2.323-1.38 0-2.5 1.12-2.5 2.5 0 0.378 0.090 0.732 0.24 1.053l-4.867 5.612c-0.273-0.102-0.564-0.166-0.873-0.166-1.381 0-2.5 1.119-2.5 2.5s1.119 2.5 2.5 2.5c1.381 0 2.5-1.119 2.5-2.5 0-0.332-0.068-0.649-0.186-0.939l4.946-5.685c0.236 0.073 0.48 0.124 0.74 0.124 0.727 0 1.377-0.316 1.834-0.813l4.669 2.341c0.017 1.367 1.127 2.471 2.497 2.471 1.381 0 2.5-1.119 2.5-2.5 0-0.044-0.011-0.086-0.013-0.13l6.503-5.587c0.309 0.137 0.649 0.216 1.010 0.216 1.381 0 2.5-1.119 2.5-2.5s-1.119-2.5-2.5-2.5z',
  // ascent: 28,
  // descent: 50,
};

function exportToCsv(filename, rows) {
  var processRow = function (row) {
    var finalVal = '';
    for (var j = 0; j < row.length; j++) {
      var innerValue = row[j] === null ? '' : row[j].toString();
      if (row[j] instanceof Date) {
        innerValue = row[j].toLocaleString();
      }
      var result = innerValue.replace(/"/g, '""');
      if (result.search(/("|,|\n)/g) >= 0) result = '"' + result + '"';
      if (j > 0) finalVal += ';';
      finalVal += result;
    }
    return finalVal + '\n';
  };

  var csvFile = '';
  for (var i = 0; i < rows.length; i++) {
    csvFile += processRow(rows[i]);
  }

  var blob = new Blob([csvFile], {type: 'text/csv;charset=utf-8;'});
  if (navigator.msSaveBlob) {
    // IE 10+
    navigator.msSaveBlob(blob, filename);
  } else {
    var link = document.createElement('a');
    if (link.download !== undefined) {
      // feature detection
      // Browsers that support HTML5 download attribute
      var url = URL.createObjectURL(blob);
      link.setAttribute('href', url);
      link.setAttribute('download', filename);
      link.style.visibility = 'hidden';
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
    }
  }
}

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
    autorange: true,
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
    autorange: true,
    showline: true,
    y: 1,
    title: {
      text: '',
      font: {size: 12},
    },
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
    state.timeseries.ts_name,
    state.timeseries.unit,
    state.timeseries.tstype_name,
    state.location.terrainlevel,
  ]);

  const toastId = useRef(null);

  const queryClient = useQueryClient();

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [xRange, setXRange] = useState(initRange);
  const [layout, setLayout] = useState(
    matches ? structuredClone(mobileLayout) : structuredClone(desktopLayout)
  );

  // useEffect(() => {
  //   setLayout((prev) => {
  //     return matches ? layout3 : layout1;
  //   });
  // }, [matches]);

  useEffect(() => {
    refetchData([ts_id, initRange]);
  }, [ts_id]);

  const handleRelayout = (e) => {
    console.log(e);
    if (e['xaxis.autorange'] == true || e['autosize'] == true) {
      setXRange(initRange);
      return;
    }

    if (e['xaxis.range[0]'] !== undefined) {
      let x0 = moment(e['xaxis.range[0]']);
      let x1 = moment(e['xaxis.range[1]']);

      const daysdiff = x1.diff(x0, 'days');

      x0 = x0.subtract(daysdiff * 0.2, 'days');
      x1 = x1.add(daysdiff * 0.2, 'days');

      setXRange([x0.format('YYYY-MM-DDTHH:mm'), x1.format('YYYY-MM-DDTHH:mm')]);
    }
  };

  const {data: graphData, refetch: refetchData} = useQuery(
    ['graphData', ts_id, xRange],
    async ({signal}) => {
      const {data} = await apiClient.get(`/data/timeseriesV2/${ts_id}`, {
        params: {
          start: xRange[0],
          stop: xRange[1],
          limit: 4000,
        },
      });
      if (data === null) {
        return [];
      }
      return data;
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  );

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

  const {data: pollData, refetch} = useQuery(
    ['pollData', ts_id],
    async () => {
      const {data, status} = await apiClient.get(`/sensor_field/station/correct/poll/${ts_id}`);
      return status;
    },
    {
      enabled: true,
      refetchInterval: (status) => {
        return status === 204 ? 1000 : false;
      },
      onSuccess: (status) => {
        if (status === 200) {
          queryClient.removeQueries(['graphData', ts_id]);
          toast.update(toastId.current, {
            render: 'Genberegnet',
            type: toast.TYPE.SUCCESS,
            isLoading: false,
            autoClose: 2000,
            closeOnClick: true,
            draggable: true,
            progress: undefined,
            hideProgressBar: false,
          });
        }
      },
      refetchOnWindowFocus: false,
      refetchOnMount: false,
      refetchOnReconnect: false,
    }
  );

  const correctMutation = useMutation(
    async (data) => {
      const {data: res} = await apiClient.post(`/sensor_field/station/correct/${ts_id}`, data);
      return res;
    },
    {
      onSuccess: () => {
        setTimeout(() => {
          refetch();
        }, 5000);
        //handleXRangeChange({'xaxis.range[0]': undefined});
      },
    }
  );

  const xControl = controlData?.map((d) => d.timeofmeas);
  const yControl = controlData?.map((d) => d.waterlevel);
  // const stationtype = graphData?.[0] ? graphData[0].properties.parameter : "";

  var downloadButton = {
    name: 'Download data',
    icon: downloadIcon,
    click: function (gd) {
      var rows = gd.data[0].x.map((elem, idx) => [
        moment(elem).format('YYYY-MM-DD HH:mm'),
        gd.data[0].y[idx].toString().replace('.', ','),
      ]);

      exportToCsv('data.csv', rows);
    },
  };

  var rerunButton = {
    name: 'Genkør data',
    icon: rerunIcon,
    click: function (gd) {
      toastId.current = toast.loading('Genberegner...');
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

  // var addHorizontalLine = {
  //   name: 'Tilføj terrænkote',
  //   icon: rerunIcon,
  //   click: function (gd) {
  //     gd.layout = {
  //       ...gd.layout,
  //       shapes: [
  //         {
  //           type: 'line',
  //           xref: 'paper',
  //           yref: 'y',
  //           x0: 0,
  //           y0: terrainlevel,
  //           x1: 1,
  //           y1: terrainlevel,
  //           line: {
  //             color: 'rgb(55, 128, 191)',
  //             width: 3,
  //             dash: 'dot',
  //           },
  //         },
  //       ],
  //     };
  //     setLayout(gd.layout);
  //   },
  // };

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
      key={ts_id}
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
        doubleClick: 'reset',
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
        marginBottom: '10px',
        paddingTop: '5px',
        border: '2px solid gray',
      }}
    >
      <PlotGraph
        ts_id={stationId}
        controlData={measurements}
        dynamicMeasurement={dynamicMeasurement}
      />
    </div>
  );
}
