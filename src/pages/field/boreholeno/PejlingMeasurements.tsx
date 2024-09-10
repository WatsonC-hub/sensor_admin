import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import PejlingMeasurementsTableDesktop from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableMobile';
import {Kontrol} from '~/types';

interface PejlingProps {
  measurements: Array<Kontrol>;
  handleEdit: (measurement: Kontrol) => void;
  handleDelete: (id: number) => void;
}

export default function PejlingMeasurements({
  measurements,
  handleEdit,
  handleDelete,
}: PejlingProps) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <PejlingMeasurementsTableMobile
      data={measurements}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />
  ) : (
    <PejlingMeasurementsTableDesktop
      data={measurements}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
    />
  );
}
