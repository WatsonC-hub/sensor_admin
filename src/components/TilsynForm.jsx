import React, { useState } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  useTheme,
} from "@mui/material";
import { isValid } from "date-fns";
import SaveIcon from "@mui/icons-material/Save";
import OwnDatePicker from "./OwnDatePicker";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";

export default function TilsynForm({
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
}) {
  const [disableSubmit, setDisableSubmit] = useState(false);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  const theme = useTheme();

  const handleCommentChange = (e) => {
    changeFormData("kommentar", e.target.value);
  };

  const handleDateChange = (date) => {
    changeFormData("dato", date);
  };

  const handleChangeBattery = (e) => {
    changeFormData("batteriskift", e.target.checked);
  };

  const handleChangeService = (e) => {
    changeFormData("tilsyn", e.target.checked);
  };

  return (
    <Card style={{ marginBottom: 25 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {formData.gid !== -1 ? "Opdater tilsyn" : "Indberet tilsyn"}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <OwnDatePicker
              label={"Dato"}
              value={formData.dato}
              onChange={(date) => handleDateChange(date)}
            />
          </Grid>
          <Grid item xs={12} sm={8}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.batteriskift}
                  onChange={handleChangeBattery}
                  name="checkedBattery"
                  color="primary"
                />
              }
              label={<label>Batteriskift</label>}
            />
            <FormControlLabel
              control={
                <Checkbox
                  checked={formData.tilsyn}
                  onChange={handleChangeService}
                  name="checkedService"
                  color="primary"
                />
              }
              label={<label>Tilsyn</label>}
            />
          </Grid>
          <Grid item xs={12} sm={12}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={formData.kommentar}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
              fullWidth
              onChange={handleCommentChange}
            />
          </Grid>
          <Grid item xs={2} sm={4}></Grid>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: theme.palette.secondary }}
              onClick={() => {
                handleClickSubmit();
                handleSubmit();
              }}
              disabled={disableSubmit}
              startIcon={<SaveIcon />}
              color="secondary"
              variant="contained"
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              style={{ backgroundColor: theme.palette.secondary }}
              onClick={resetFormData}
              color="secondary"
              variant="contained"
            >
              Annuller
            </Button>
          </Grid>
          <Grid item xs={2} sm={4}></Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}
