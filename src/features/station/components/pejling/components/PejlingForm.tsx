import CompoundPejling from '../CompoundPejling';

const PejlingForm = () => {
  return (
    <div>
      <CompoundPejling.NotPossible />
      <br />
      <CompoundPejling.Measurement sx={{maxWidth: 400}} />
      <CompoundPejling.WaterlevelAlert />
      <CompoundPejling.TimeOfMeas sx={{maxWidth: 400}} />
      <br />
      <CompoundPejling.Correction sx={{maxWidth: 400}} />
      <CompoundPejling.Comment sx={{maxWidth: 800}} />
    </div>
  );
};

export default PejlingForm;
