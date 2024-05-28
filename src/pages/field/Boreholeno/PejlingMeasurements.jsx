import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PejlingMeasurementsTableMobile from './components/tableComponents/PejlingMeasurementsTableMobile';
import PejlingMeasurementsTableDesktop from './components/tableComponents/PejlingMeasurementsTableDesktop';

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
