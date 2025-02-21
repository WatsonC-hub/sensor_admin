import {Box} from '@mui/material';
import {useEffect, useState} from 'react';

import PlotlyGraph from '~/components/PlotlyGraph';
import {setGraphHeight} from '~/consts';
import {usePejling} from '~/features/pejling/api/usePejling';
import {addValueToDate, convertDate, currentDate, subtractFromDate} from '~/helpers/dateConverter';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useBreakpoints from '~/hooks/useBreakpoints';
import {PejlingItem} from '~/types';

import useStationGraphHook from '../hooks/useStationGraphHook';

const initRange = [convertDate('1900-01-01', 'YYYY-MM-DDTHH:mm'), currentDate('YYYY-MM-DDTHH:mm')];

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
        subtractFromDate(dynamicMeasurement?.[0] as string, 4, 'day').format('YYYY-MM-DD'),
        addValueToDate(dynamicMeasurement?.[0] as string, 3, 'day').format('YYYY-MM-DD'),
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
