import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import {Layout, PlotData} from 'plotly.js';
import React, {useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {useLocationData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useAppContext} from '~/state/contexts';
import {BoreholeMeasurement, Maalepunkt} from '~/types';

type JupiterData = {
  data: {
    situation: Array<number | null>;
    x: Array<string>;
    y: Array<number>;
  };
};

interface PlotGraphProps {
  dynamicMeasurement: Array<string | number> | undefined;
}

export default function PlotGraph({dynamicMeasurement}: PlotGraphProps) {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const [control, setcontrol] = useState<Array<BoreholeMeasurement>>();

  // const {boreholeno, intakeno} = useAppContext(['boreholeno', 'intakeno']);

  const {data: location} = useLocationData(loc_id);
  const boreholeno = location?.boreholeno;
  const intakeno = location?.timeseries.find((ts) => ts.ts_id === ts_id)?.intakeno;
  const {isMobile} = useBreakpoints();
  const xOurData = control?.map((d) => d.timeofmeas);
  const yOurData = control?.map((d) => (d.waterlevel ? d.waterlevel : null));

  const [xDynamicMeasurement, setXDynamicMeasurement] = useState<Array<string | number>>([]);
  const [yDynamicMeasurement, setYDynamicMeasurement] = useState<Array<string | number>>([]);

  const {data: watlevmp} = useQuery({
    queryKey: ['watlevmp', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
    placeholderData: [],
  });

  const {data: jupiterData} = useQuery({
    queryKey: ['jupiter_waterlevel', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get<JupiterData>(
        `/sensor_field/borehole/jupiter/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
  });

  const {data: measurements} = useQuery({
    queryKey: ['measurements', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
    placeholderData: [],
  });

  useEffect(() => {
    let ctrls = [];
    console.log(watlevmp, 'watlevmp');
    console.log(measurements, 'measurements');
    console.log('boreholeno', boreholeno);
    console.log('intakeno', intakeno);
    if (watlevmp.length > 0) {
      ctrls = measurements?.map((e: BoreholeMeasurement) => {
        const elev = watlevmp.filter((e2: Maalepunkt) => {
          return (
            moment(e.timeofmeas) >= moment(e2.startdate) &&
            moment(e.timeofmeas) < moment(e2.enddate)
          );
        })[0].elevation;

        return {
          ...e,
          waterlevel: e.disttowatertable_m ? elev - e.disttowatertable_m : null,
        };
      });
    } else {
      ctrls = measurements?.map((elem: BoreholeMeasurement) => {
        return {...elem, waterlevel: elem.disttowatertable_m};
      });
    }
    setcontrol(ctrls);
  }, [watlevmp, measurements]);

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
      <PlotlyGraph plotModebarButtons={['toImage']} layout={layout} data={data} />
    </Box>
  );
}
