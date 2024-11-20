import useBreakpoints from '~/hooks/useBreakpoints';
import PejlingMeasurementsTableDesktop from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableMobile';
import {Kontrol} from '~/types';

interface PejlingProps {
  measurements: Array<Kontrol>;
  handleEdit: (type: string) => (kontrol: any) => void;
  handleDelete: (id: number) => void;
}

export default function PejlingMeasurements({
  measurements,
  handleEdit,
  handleDelete,
}: PejlingProps) {
  const {isMobile} = useBreakpoints();

  return isMobile ? (
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
