import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import {Layout, PlotData} from 'plotly.js';
import React, {useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {BoreholeMeasurement} from '~/types';

type JupiterData = {
  data: {
    situation: Array<number | null>;
    x: Array<string>;
    y: Array<number>;
  };
};

interface PlotGraphProps {
  ourData: Array<BoreholeMeasurement>;
  dynamicMeasurement: Array<string | number> | undefined;
}

export default function PlotGraph({ourData, dynamicMeasurement}: PlotGraphProps) {
  const {boreholeno, intakeno} = useAppContext(['boreholeno', 'intakeno']);

  const {isMobile} = useBreakpoints();
  const xOurData = ourData?.map((d) => d.timeofmeas);
  const yOurData = ourData?.map((d) => (d.waterlevel ? d.waterlevel : null));

  const [xDynamicMeasurement, setXDynamicMeasurement] = useState<Array<string | number>>([]);
  const [yDynamicMeasurement, setYDynamicMeasurement] = useState<Array<string | number>>([]);

  const {data: jupiterData} = useQuery({
    queryKey: queryKeys.Borehole.jupiterData(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<JupiterData>(
        `/sensor_field/borehole/jupiter/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
  });

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
    const x = jupiterData ? indexes?.map((index) => jupiterData.data.x[index]) : [];
    const y = jupiterData ? indexes?.map((index) => jupiterData.data.y[index]) : [];

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
    x: Array.prototype.map((item) => item.toISOString(), xOurData),
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

  const layout: Partial<Layout> = isMobile
    ? {
        showlegend: false,
      }
    : {
        yaxis: {
          title: 'Vandstand',
        },
        yaxis2: {},
      };

  return (
    <Box
      style={{
        width: 'auto',
        height: setGraphHeight(isMobile),
      }}
    >
      <PlotlyGraph layout={layout} data={data} />
    </Box>
  );
}
