import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import MaalepunktTableDesktop from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableMobile';
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
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Box display="flex" justifyContent={{sm: 'center'}}>
        {matches ? (
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
      </Box>
    </>
  );
}
