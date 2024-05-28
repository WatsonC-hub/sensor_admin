import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import PejlingMeasurementsTableDesktop from '~/components/tableComponents/PejlingMeasurementsTableDesktop';
import PejlingMeasurementsTableMobile from '~/components/tableComponents/PejlingMeasurementsTableMobile';

export default function PejlingMeasurements(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  const correction_map = {
    0: 'Kontrol',
    1: 'Korrektion fremadrettet',
    2: 'Korrektion frem og tilbage til start af tidsserie',
    3: 'Lineær',
    4: 'Korrektion frem og tilbage til udstyr',
    5: 'Korrektion frem og tilbage til niveau spring',
    6: 'Korrektion frem og tilbage til forrige spring',
  };

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
