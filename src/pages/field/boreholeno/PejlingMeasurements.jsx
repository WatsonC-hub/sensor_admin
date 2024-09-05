import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import PejlingMeasurementsTableDesktop from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/pages/field/boreholeno/components/tableComponents/PejlingMeasurementsTableMobile';

export default function PejlingMeasurements(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <PejlingMeasurementsTableMobile
      data={props.measurements}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
    />
  ) : (
    <PejlingMeasurementsTableDesktop
      data={props.measurements}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
    />
  );
}
