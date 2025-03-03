import usePermissions from '~/features/permissions/api/usePermissions';
import useBreakpoints from '~/hooks/useBreakpoints';
import MaalepunktTableDesktop from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableMobile';
import {useAppContext} from '~/state/contexts';
import {MaalepunktTableData} from '~/types';

interface MaalepunktTableProps {
  watlevmp: Array<MaalepunktTableData>;
  handleEdit: (Maalepunkt: MaalepunktTableData) => void;
  handleDelete: (gid: number) => void;
}

export default function MaalepunktTable({
  watlevmp,
  handleEdit,
  handleDelete,
}: MaalepunktTableProps) {
  const {isMobile} = useBreakpoints();
  const {boreholeno} = useAppContext(['boreholeno']);
  const {
    borehole_permission_query: {data: permissions},
  } = usePermissions();

  return (
    <>
      {isMobile ? (
        <MaalepunktTableMobile
          data={watlevmp}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
        />
      ) : (
        <MaalepunktTableDesktop
          data={watlevmp}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
          disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
        />
      )}
    </>
  );
}
