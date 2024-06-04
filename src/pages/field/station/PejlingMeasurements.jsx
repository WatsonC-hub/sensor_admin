import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';

import PejlingMeasurementsTableDesktop from '~/components/tableComponents/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/components/tableComponents/PejlingMeasurementsTableMobile';
import {correction_map} from '~/consts';

export default function PejlingMeasurements(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <PejlingMeasurementsTableMobile
      data={props.measurements}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
      correction_map={correction_map}
    />
  ) : (
    <PejlingMeasurementsTableDesktop
      data={props.measurements}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
      correction_map={correction_map}
    />
  );
}
