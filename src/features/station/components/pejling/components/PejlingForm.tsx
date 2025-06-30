import {Grid2} from '@mui/material';
import CompoundPejling from '../CompoundPejling';

const PejlingForm = () => {
  return (
    <Grid2
      container
      display={'flex'}
      size={12}
      flexDirection={'column'}
      alignItems={'center'}
      alignContent={'center'}
      justifyContent={'center'}
      spacing={2}
    >
      <Grid2
        container
        size={12}
        display={'flex'}
        flexDirection={'row'}
        alignContent={'center'}
        justifyContent={'center'}
      >
        <CompoundPejling.NotPossible />
      </Grid2>

      <Grid2 size={12} maxWidth={400}>
        <CompoundPejling.Measurement />
        <CompoundPejling.WaterlevelAlert />
      </Grid2>
      <Grid2 container spacing={1} size={12} mb={2} display={'flex'} flexDirection={'row'}>
        <CompoundPejling.TimeOfMeas sx={{mb: 0}} label="Tidspunkt" />
      </Grid2>
      <CompoundPejling.Correction />
      <CompoundPejling.Comment />
    </Grid2>
  );
};

export default PejlingForm;
