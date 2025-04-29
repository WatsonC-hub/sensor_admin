import {Box} from '@mui/material';
import moment from 'moment';
import {useEffect, useState} from 'react';

import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import useBreakpoints from '~/hooks/useBreakpoints';
import {controlData} from '~/types';

import useStationGraphHook from '../hooks/useStationGraphHook';

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

interface PlotGraphProps {
  dynamicMeasurement?: Array<string | number>;
}

export default function PlotGraph({dynamicMeasurement}: PlotGraphProps) {
  const [controlData, setControlData] = useState<Array<controlData>>();
  const [xRange, setXRange] = useState(initRange);

  const {
    get: {data: measurements},
  } = usePejling();
  const {isMobile} = useBreakpoints();

  const {layout, data, fetchRaw, setShowRawData} = useStationGraphHook(
    dynamicMeasurement,
    controlData,
    xRange
  );

  useEffect(() => {
    console.log(measurements);
    setControlData(
      measurements?.map((item) => ({
        waterlevel: item.referenced_measurement,
        timeofmeas: item.timeofmeas,
        useforcorrection: item.useforcorrection,
      }))
    );
  }, [measurements]);

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
