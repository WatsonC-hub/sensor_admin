import {Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';

const PejlingForm = () => {
  return (
    <Grid2
      container
      flexDirection={'column'}
      alignContent={'center'}
      justifyContent={'center'}
      p={1}
    >
      <Grid2 size={12} justifyItems={'center'}>
        <CompoundPejling.NotPossible />
      </Grid2>

      <Grid2 size={12} maxWidth={400}>
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid2>
      <Grid2 mb={1}>
        <CompoundPejling.TimeOfMeas label="Tidspunkt" />
      </Grid2>
      <CompoundPejling.Correction />
      <CompoundPejling.Comment fullWidth />
    </Grid2>
  );
};

export default PejlingForm;
