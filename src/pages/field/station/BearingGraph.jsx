import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';

import {apiClient} from '~/apiClient';
import {correction_map, setGraphHeight} from '~/consts';
import {downloadIcon, makeLinkIcon, rawDataIcon, rerunIcon} from '~/helpers/plotlyIcons';
import {useGraphData} from '~/hooks/query/useGraphData';
import {useCorrectData} from '~/hooks/useCorrectData';
import {stamdataStore} from '~/state/store';

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

// const initRange = [
//   moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
//   moment().format('YYYY-MM-DDTHH:mm'),
// ];

function PlotGraph({ts_id, controlData, dynamicMeasurement}) {
  const [name, unit, stationtype] = stamdataStore((state) => [
    state.location.loc_name + ' ' + state.timeseries.ts_name,
    state.timeseries.unit,
    state.timeseries.tstype_name,
  ]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const [xRange, setXRange] = useState(initRange);
  const [layout, setLayout] = useState(
    matches ? structuredClone(mobileLayout) : structuredClone(desktopLayout)
  );
  const [showRawData, setShowRawData] = useState(false);

  const {data: graphData, refetch: refetchData} = useGraphData(ts_id, xRange);
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

  useEffect(() => {
    graphData !== undefined && refetchData([ts_id, xRange]);
    console.log(xRange);
  }, [graphData, refetchData, ts_id, xRange]);

  // const handleResize = (e) => {
  //   console.log(firstRender);
  //   if (xRange !== initRange) {
  //     e.layout.xaxis.range = xRange;
  //     setLayout(() => {
  //       return [e.layout];
  //     });
  //   }
  //   console.log(e.layout.xaxis.range);
  // };
  const {mutation: correctMutation} = useCorrectData(ts_id, 'graphData');

  const handleRelayout = (e) => {
    console.log(e);
    if (e['xaxis.autorange'] == true || e['autosize'] == true) {
      setXRange(initRange);
      return;
    }

    // if (e['autosize'] && !firstRender) {
    //   setXRange([
    //     moment(graphData.x[graphData.x.length - 10]).format('YYYY-MM-DDTHH:mm'),
    //     moment(graphData.x[graphData.x.length]).format('YYYY-MM-DDTHH:mm'),
    //   ]);
    //   console.log(graphData);
    //   console.log(xRange);
    //   setFirstRender(true);

    //   return;
    // }

    if (e['dragmode']) {
      setLayout((prev) => {
        return {
          ...prev,
          dragmode: e['dragmode'],
        };
      });
      console.log('drag');
    }

    if (e['xaxis.range[0]'] !== undefined) {
      console.log('I dont know');
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
    click: function () {
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
      setShowRawData(true);
      setLayout(gd.layout);
    },
  };

  var makeLinkButton = {
    name: 'Ekstern link',
    icon: makeLinkIcon,
    click: function () {
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
    <>
      {graphData !== undefined && (
        <Plot
          // key={ts_id}
          id={`graph_${ts_id}`}
          divId={`graph_${ts_id}`}
          data={[
            {
              x: graphData?.x,
              y: graphData?.y,
              name: name,
              type: 'scatter',
              line: {width: 2},
              mode: 'lines',
              marker: {symbol: '100', size: '3', color: '#177FC1'},
            },
            {
              x: showRawData ? rawData?.x : [],
              y: showRawData ? rawData?.y : [],
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
              text: textControl,
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
          // onInitialized={handleResize}
          // onDoubleClick={() => setXRange(initRange)}
        />
      )}
    </>
  );
}

export default function BearingGraph({stationId, measurements, dynamicMeasurement}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  return (
    <div
      style={{
        width: 'auto',
        height: setGraphHeight(matches),
        // marginBottom: '10px',
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
