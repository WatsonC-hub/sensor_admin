import { Grid } from "@mui/material";

import CompoundPejling from "../CompoundPejling";

const PejlingForm = () => {
  return (
    <Grid
      container
      sx={{
        justifyContent: "center",
        flexDirection: "column",
        alignItems: "center",
        p: 1,
        maxWidth: 350,
      }}
    >
      <CompoundPejling.NotPossible />
      <CompoundPejling.Measurement />
      <CompoundPejling.WaterlevelAlert />
      <CompoundPejling.TimeOfMeas label="Tidspunkt" />
      <CompoundPejling.Correction />
      <CompoundPejling.Comment fullWidth />
    </Grid>
  );
};

export default PejlingForm;
