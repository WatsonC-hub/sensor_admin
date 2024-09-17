import {Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import {useQuery} from '@tanstack/react-query';
import {useContext} from 'react';

import {apiClient} from '~/apiClient';
import {usePejling} from '~/features/pejling/api/usePejling';
import PejlingMeasurementsTableDesktop from '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/features/pejling/components/PejlingMeasurementsTableMobile';
import {MetadataContext} from '~/state/contexts';
import {LatestMeasurement, PejlingItem} from '~/types';

import LatestMeasurementMobile from './LatestMeasurementMobile';
import LatestMeasurementTable from './LatestMeasurementTable';

interface PejlingMeasurementsProps {
  handleEdit: (data: PejlingItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
  ts_id: number;
}

export default function PejlingMeasurements({
  handleEdit,
  handleDelete,
  canEdit,
  ts_id,
}: PejlingMeasurementsProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));
  const metadata = useContext(MetadataContext);

  let calculated = false;
  if (metadata && 'calculated' in metadata) calculated = metadata.calculated as boolean;

  // const latestMeasurement = undefined;
  const {data: latestMeasurement} = useQuery({
    queryKey: ['latest_measurement', ts_id],
    queryFn: async () => {
      console.log(metadata);
      console.log(ts_id);
      const {data} = await apiClient.get<LatestMeasurement>(
        `/sensor_field/station/latest_measurement/${ts_id}/${calculated}`
      );
      return data;
    },
    staleTime: 10,
    enabled: ts_id !== undefined && ts_id !== null && ts_id !== -1,
  });

  const {
    get: {data: measurements},
  } = usePejling();

  return matches ? (
    <>
      <Typography variant="h6">Seneste Måling</Typography>
      <LatestMeasurementMobile
        latestMeasurement={latestMeasurement ? [latestMeasurement] : []}
        ts_id={ts_id}
      />
      <Typography variant="h6">Kontrol pejlinger</Typography>
      <PejlingMeasurementsTableMobile
        data={measurements}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        canEdit={canEdit}
      />
    </>
  ) : (
    <>
      <LatestMeasurementTable
        latestMeasurement={latestMeasurement ? [latestMeasurement] : []}
        ts_id={ts_id}
      />
      <PejlingMeasurementsTableDesktop
        data={measurements}
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        canEdit={canEdit}
      />
    </>
  );
}
