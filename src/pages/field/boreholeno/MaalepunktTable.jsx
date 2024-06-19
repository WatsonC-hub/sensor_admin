import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import MaalepunktTableDesktop from './components/tableComponents/MaalepunktTableDesktop';
import MaalepunktTableMobile from './components/tableComponents/MaalepunktTableMobile';

export default function MaalepunktTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
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
  );
}
