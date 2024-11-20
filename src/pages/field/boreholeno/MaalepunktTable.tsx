import useBreakpoints from '~/hooks/useBreakpoints';
import MaalepunktTableDesktop from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableMobile';
import {MaalepunktTableData} from '~/types';

interface MaalepunktTableProps {
  watlevmp: Array<MaalepunktTableData>;
  handleEdit: (type: string) => (Maalepunkt: any) => void;
  handleDelete: (gid: number) => void;
}

export default function MaalepunktTable({
  watlevmp,
  handleEdit,
  handleDelete,
}: MaalepunktTableProps) {
  const {isMobile} = useBreakpoints();

  return (
    <>
      {isMobile ? (
        <MaalepunktTableMobile
          data={watlevmp}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      ) : (
        <MaalepunktTableDesktop
          data={watlevmp}
          handleEdit={handleEdit}
          handleDelete={handleDelete}
        />
      )}
    </>
  );
}
