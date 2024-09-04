import {Box} from '@mui/material';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import MaalepunktTableDesktop from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from '~/pages/field/boreholeno/components/tableComponents/MaalepunktTableMobile';

export default function MaalepunktTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return (
    <>
      <Box display="flex" justifyContent={{sm: 'center'}}>
        {matches ? (
          <MaalepunktTableMobile
            data={props.watlevmp}
            handleEdit={props.handleEdit}
            handleDelete={props.handleDelete}
          />
        ) : (
          <MaalepunktTableDesktop
            data={props.watlevmp}
            handleEdit={props.handleEdit}
            handleDelete={props.handleDelete}
          />
        )}
      </Box>
    </>
  );
}
