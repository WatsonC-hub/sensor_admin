import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {Layout, PlotData} from 'plotly.js';
import React, {useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {Measurement} from '~/types';

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
  const yOurData = ourData?.map((d) => (d.waterlevel ? d.disttowatertable_m : null));

  const [xDynamicMeasurement, setXDynamicMeasurement] = useState<Array<string | number>>([]);
  const [yDynamicMeasurement, setYDynamicMeasurement] = useState<Array<string | number>>([]);

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

    const trace: Partial<PlotData> = {
      x,
      y,
      // name: i ? (i in TRACE_NAMES ? TRACE_NAMES[i] : null) : null,
      name: name,
      type: 'scattergl',
      line: {width: 2},
      mode: 'lines+markers',
      marker: {symbol: '100', size: 8},
    };
    return trace;
  });

  const plotOurData: Partial<PlotData> = {
    x: xOurData,
    y: yOurData,
    name: 'Calypso data',
    type: 'scattergl',
    mode: 'markers',
    marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
  };

  const dynamicMeas: Partial<PlotData> = {
    x: xDynamicMeasurement,
    y: yDynamicMeasurement,
    name: '',
    type: 'scattergl',
    mode: 'markers',
    showlegend: false,
    marker: {symbol: '50', size: 8, color: 'rgb(0,120,109)'},
  };

  const data: Array<Partial<PlotData>> = [...jupiterTraces, plotOurData, dynamicMeas];

  const layout: Partial<Layout> = matches
    ? {
        showlegend: false,
      }
    : {
        yaxis: {
          title: 'Vandstand',
        },
        yaxis2: {},
      };

  return <PlotlyGraph plotModebarButtons={['toImage']} layout={layout} data={data} />;
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
    <Box
      style={{
        width: 'auto',
        height: setGraphHeight(matches),
      }}
    >
      <PlotGraph
        jupiterData={data}
        ourData={measurements}
        dynamicMeasurement={dynamicMeasurement}
      />
    </Box>
  );
}
