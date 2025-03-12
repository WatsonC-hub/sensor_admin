import {Typography} from '@mui/material';

import PejlingMeasurementsTableDesktop from '~/features/pejling/components/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/features/pejling/components/PejlingMeasurementsTableMobile';
import useBreakpoints from '~/hooks/useBreakpoints';
import {PejlingItem} from '~/types';

interface PejlingMeasurementsProps {
  handleEdit: (data: PejlingItem) => void;
  handleDelete: (gid: number | undefined) => void;
  disabled: boolean;
}

export default function PejlingMeasurements({
  handleEdit,
  handleDelete,
  disabled,
}: PejlingMeasurementsProps) {
  const {isMobile} = useBreakpoints();

  return isMobile ? (
    <>
      <Typography variant="h6">Kontrol pejlinger</Typography>
      <PejlingMeasurementsTableMobile
        handleEdit={handleEdit}
        handleDelete={handleDelete}
        disabled={disabled}
      />
    </>
  ) : (
    <PejlingMeasurementsTableDesktop
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      disabled={disabled}
    />
  );
}
