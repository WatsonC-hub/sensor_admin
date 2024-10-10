import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {Layout, RangeSelector, RangeSelectorButton} from 'plotly.js';
import React, {useEffect, useState} from 'react';
import Plot from 'react-plotly.js';

import {apiClient} from '~/apiClient';
import {setGraphHeight} from '~/consts';
import usePlotlyLayout from '~/features/kvalitetssikring/components/usePlotlyLayout';
import {MergeType} from '~/helpers/EnumHelper';
import {Measurement} from '~/types';

const selectorOptions: Partial<RangeSelector> = {
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
  ] as Array<RangeSelectorButton>,
};

const layout1: Partial<Layout> = {
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: 'date',
    showline: true,
  },

  //xaxis: {domain: [0, 0.9]},
  yaxis: {
    title: {
      text: '',
      font: {size: 12},
    },
    showline: true,
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

const layout3: Partial<Layout> = {
  modebar: {
    orientation: 'v',
  },
  //autosize: true,
  xaxis: {
    rangeselector: selectorOptions,
    autorange: true,
    type: 'date',
  },

  yaxis: {
    showline: true,
    title: {
      text: '',
      font: {size: 12},
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

// const TRACE_NAMES = {
//   0: 'Jupiter - i ro',
//   1: 'Jupiter - i drift',
// };

interface PlotGraphProps {
  jupiterData: {
    data: {
      situation: Array<number | null>;
      x: Array<string>;
      y: Array<number>;
    };
  };
  ourData: Array<Measurement>;
  dynamicMeasurement: Array<string | number> | undefined;
}

function PlotGraph({jupiterData, ourData, dynamicMeasurement}: PlotGraphProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));
  const xOurData = ourData?.map((d) => d.timeofmeas);
  const yOurData = ourData?.map((d) => d.waterlevel);

  const [xDynamicMeasurement, setXDynamicMeasurement] = useState<Array<string | number>>([]);
  const [yDynamicMeasurement, setYDynamicMeasurement] = useState<Array<string | number>>([]);

  const layout2 = matches
    ? {
        showlegend: false,
      }
    : {
        yaxis2: {},
      };

  const [mergedLayout] = usePlotlyLayout(MergeType.SHALLOWMERGE, layout2);

  useEffect(() => {
    if (dynamicMeasurement !== undefined) {
      setXDynamicMeasurement([dynamicMeasurement[0]]);
      setYDynamicMeasurement([dynamicMeasurement[1]]);
    } else {
      setXDynamicMeasurement([]);
      setYDynamicMeasurement([]);
    }
  }, [dynamicMeasurement]);

  const jupiterTraces = [null, 0, 1].map((situation) => {
    // get indexes where data.situation is 0, 1 or null
    const indexes = jupiterData?.data?.situation
      ?.map((innersituation, index) => ({isSituation: innersituation == situation, index: index}))
      .filter((d) => d.isSituation !== false)
      .map((item) => item.index);
    // get x and y values for each situation
    const x = indexes?.map((index) => jupiterData.data.x[index]);
    const y = indexes?.map((index) => jupiterData.data.y[index]);

    let name = 'Jupiter - ukendt årsag';
    if (situation === 0) name = 'Jupiter - i ro';
    else if (situation === 1) name = 'Jupiter - i drift';

    return {
      x,
      y,
      // name: i ? (i in TRACE_NAMES ? TRACE_NAMES[i] : null) : null,
      name: name,
      type: 'scattergl',
      line: {width: 2},
      mode: 'lines+markers',
      marker: {symbol: '100', size: '8'},
    };
  });

  const data: any = [
    ...jupiterTraces,
    {
      x: xOurData,
      y: yOurData,
      name: 'Calypso data',
      type: 'scattergl',
      mode: 'markers',
      marker: {symbol: '50', size: '8', color: 'rgb(0,120,109)'},
    },
    {
      x: xDynamicMeasurement,
      y: yDynamicMeasurement,
      name: '',
      type: 'scattergl',
      mode: 'markers',
      showlegend: false,
      marker: {symbol: '50', size: '8', color: 'rgb(0,120,109)'},
    },
  ];

  const layout: Partial<Layout> = matches
    ? {
        ...mergedLayout,
        yaxis: {
          ...layout3.yaxis,
          // title: "Vandstand",
        },
      }
    : {
        ...mergedLayout,
        yaxis: {
          ...layout1.yaxis,
          title: 'Vandstand',
        },
      };

  return (
    <Plot
      data={data}
      layout={layout}
      config={{
        responsive: true,
        modeBarButtonsToRemove: [
          'select2d',
          'lasso2d',
          'autoScale2d',
          'hoverCompareCartesian',
          'hoverClosestCartesian',
          'toggleSpikelines',
        ],
        displaylogo: false,
        displayModeBar: true,
      }}
      useResizeHandler={true}
      style={{width: '99%', height: '100%'}}
    />
  );
}

interface BearingGraphProps {
  boreholeno: string;
  intakeno: number;
  measurements: Array<Measurement>;
  dynamicMeasurement: Array<string | number> | undefined;
}

export default function BearingGraph({
  boreholeno,
  intakeno,
  measurements,
  dynamicMeasurement,
}: BearingGraphProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('md'));

  const {data} = useQuery({
    queryKey: ['jupiter_waterlevel', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/jupiter/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== '-1' && boreholeno !== null && intakeno !== -1,
  });

  return (
    <div
      style={{
        width: 'auto',
        height: setGraphHeight(matches),
        marginBottom: '5px',
      }}
    >
      <PlotGraph
        jupiterData={data}
        ourData={measurements}
        dynamicMeasurement={dynamicMeasurement}
      />
    </div>
  );
}
