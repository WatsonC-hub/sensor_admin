import usePermissions from '~/features/permissions/api/usePermissions';
import useBreakpoints from '~/hooks/useBreakpoints';
import PejlingMeasurementsTableDesktop from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableMobile';
import {useAppContext} from '~/state/contexts';
import {BoreholeMeasurement} from '~/types';

interface PejlingProps {
  measurements: Array<BoreholeMeasurement> | undefined;
  handleEdit: (measurement: BoreholeMeasurement) => void;
  handleDelete: (id: number) => void;
}

export default function PejlingMeasurements({
  measurements,
  handleEdit,
  handleDelete,
}: PejlingProps) {
  const {isMobile} = useBreakpoints();
  const {boreholeno} = useAppContext(['boreholeno']);
  const {
    borehole_permission_query: {data: permissions},
  } = usePermissions();

  return isMobile ? (
    <PejlingMeasurementsTableMobile
      data={measurements}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
    />
  ) : (
    <PejlingMeasurementsTableDesktop
      data={measurements}
      handleEdit={handleEdit}
      handleDelete={handleDelete}
      disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
    />
  );
}
