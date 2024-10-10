import {Typography} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

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

  return matches ? (
    <>
      <Typography variant="h6">Kontrol pejlinger</Typography>
      <PejlingMeasurementsTableMobile
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        canEdit={canEdit}
      />
    </>
  ) : (
    <PejlingMeasurementsTableDesktop
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      canEdit={canEdit}
    />
  );
}
