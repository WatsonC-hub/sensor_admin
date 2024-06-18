import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import {usePejling} from '~/features/api/usePejling';
import PejlingMeasurementsTableDesktop from '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/features/pejling/components/PejlingMeasurementsTableMobile';
import {PejlingItem} from '~/types';

interface PejlingMeasurementsProps {
  handleEdit: (data: PejlingItem) => void;
  handleDelete: (gid: number | undefined) => void;
  canEdit: boolean;
}

export default function PejlingMeasurements({
  handleEdit,
  handleDelete,
  canEdit,
}: PejlingMeasurementsProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const {
    get: {data: measurements},
  } = usePejling();

  if (measurements === undefined) return null;

  return matches ? (
    <PejlingMeasurementsTableMobile
      data={measurements}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  ) : (
    <PejlingMeasurementsTableDesktop
      data={measurements}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  );
}
