import {Grid} from '@mui/material';
import CompoundPejling from '../CompoundPejling';

const PejlingForm = () => {
  return (
    <Grid
      container
      sx={{
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'center',
        p: 1,
      }}
    >
      <Grid
        size={12}
        sx={{
          justifyItems: 'center',
        }}
      >
        <CompoundPejling.NotPossible />
      </Grid>
      <Grid
        size={12}
        sx={{
          maxWidth: 400,
        }}
      >
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid>
      <Grid
        sx={{
          mb: 1,
        }}
      >
        <CompoundPejling.TimeOfMeas label="Tidspunkt" />
      </Grid>
      <CompoundPejling.Correction />
      <CompoundPejling.Comment fullWidth />
    </Grid>
  );
};

export default PejlingForm;
