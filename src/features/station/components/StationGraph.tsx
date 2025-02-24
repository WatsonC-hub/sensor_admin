import {Box} from '@mui/material';
import moment from 'moment';
import {useEffect, useState} from 'react';

import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import {PejlingItem} from '~/types';

import useStationGraphHook from '../hooks/useStationGraphHook';

const initRange = [
  moment('1900-01-01').format('YYYY-MM-DDTHH:mm'),
  moment().format('YYYY-MM-DDTHH:mm'),
];

interface PlotGraphProps {
  dynamicMeasurement: Array<string | number> | undefined;
}

export default function PlotGraph({dynamicMeasurement}: PlotGraphProps) {
  const [controlData, setControlData] =
    useState<Array<PejlingItem & {waterlevel: number | null}>>();
  const [xRange, setXRange] = useState(initRange);

  const {
    get: {data: watlevmp},
  } = useMaalepunkt();
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
    setControlData(ctrls);
  }, [watlevmp, measurements]);

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
