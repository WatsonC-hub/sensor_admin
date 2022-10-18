import React, { useState, useEffect } from "react";
import {
  Grid,
  Typography,
  TextField,
  Button,
  Card,
  CardContent,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
  useTheme,
} from "@mui/material";
import { isValid } from "date-fns";
import { InputAdornment } from "@mui/material";
import moment from "moment";
import SaveIcon from "@mui/icons-material/Save";
import OwnDatePicker from "./OwnDatePicker";
import { Checkbox } from "@mui/material";
import { Tooltip } from "@mui/material";
import { stamdataStore } from "../state/store";

export default function PejlingForm({
  stationId,
  formData,
  changeFormData,
  handleSubmit,
  resetFormData,
  mpData,
  isWaterlevel,
  isFlow,
}) {
  const [pejlingOutOfRange, setPejlingOutOfRange] = useState(false);
  const handleUsageChange = (e) => {
    changeFormData("useforcorrection", e.target.value);
  };
  const [currentMP, setCurrentMP] = useState({
    elevation: 0,
    mp_description: "",
  });

  const [notPossible, setNotPossible] = useState(false);
  const [disableSubmit, setDisableSubmit] = useState(false);

  const [stationUnit] = stamdataStore((state) => [state.timeseries.unit]);

  const handleClickSubmit = () => {
    setDisableSubmit(true);
    setTimeout(() => {
      setDisableSubmit(false);
    }, 2500);
  };

  useEffect(() => {
    if (mpData.length > 0) {
      var mp = mpData.filter((elem) => {
        if (
          moment(formData.timeofmeas).isSameOrAfter(elem.startdate) &&
          moment(formData.timeofmeas).isBefore(elem.enddate)
        ) {
          return true;
        }
      });

      if (mp.length > 0) {
        setPejlingOutOfRange(false);
        setCurrentMP(mp[0]);
      } else {
        setPejlingOutOfRange(true);
      }
    }
  }, [formData.gid, mpData]);

  const handleDateChange = (date) => {
    if (isValid(date)) {
      console.log("date is valid again: ", date);
      changeFormData("timeofmeas", date);
    }

    if (isWaterlevel) {
      var mp = mpData.filter((elem) => {
        if (
          moment(date).isSameOrAfter(elem.startdate) &&
          moment(date).isBefore(elem.enddate)
        ) {
          return true;
        }
      });

      if (mp.length > 0) {
        setPejlingOutOfRange(false);
        setCurrentMP(mp[0]);
      } else {
        setPejlingOutOfRange(true);
      }
    }
  };

  const handleCommentChange = (e) => {
    changeFormData("comment", e.target.value);
  };

  const handleDistanceChange = (e) => {
    changeFormData("measurement", e.target.value);
  };

  const handleNotPossibleChange = (e) => {
    setNotPossible(!notPossible);
    changeFormData("measurement", null);
  };

  return (
    <Card style={{ marginBottom: 25 }}>
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {formData.gid !== -1 ? "Opdater kontrol" : "Indberet kontrol"}
        </Typography>
        <Grid container spacing={3}>
          <Grid item xs={12} sm={6}>
            <OwnDatePicker
              label="Start dato"
              value={new Date(formData.timeofmeas)}
              onChange={(date) => handleDateChange(date)}
              error={pejlingOutOfRange}
              helperText={
                pejlingOutOfRange ? "Dato ligger uden for et målepunkt" : ""
              }
            />
          </Grid>
          <Grid item xs={8} sm={3}>
            <TextField
              type="number"
              variant="outlined"
              label={
                <Typography variant="h6" component="h3">
                  {isWaterlevel ? "Pejling (nedstik)" : "Måling"}
                </Typography>
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {isWaterlevel ? "m" : stationUnit}
                  </InputAdornment>
                ),
              }}
              InputLabelProps={{ shrink: true }}
              fullWidth
              value={formData.measurement}
              onChange={handleDistanceChange}
              disabled={notPossible}
            />
          </Grid>
          <Grid item xs={4} sm={3}>
            <Tooltip title="f.eks. tør eller tilfrossen">
              <FormControlLabel
                control={<Checkbox onChange={handleNotPossibleChange} />}
                label="Måling ikke mulig"
              />
            </Tooltip>
          </Grid>
          {isWaterlevel && (
            <>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="number"
                  variant="outlined"
                  disabled={true}
                  label={
                    <Typography variant="h6" component="h3">
                      Målepunktskote
                    </Typography>
                  }
                  InputProps={{
                    endAdornment: (
                      <InputAdornment position="start">m</InputAdornment>
                    ),
                    style: { color: "black" },
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={pejlingOutOfRange ? "" : currentMP.elevation}
                />
              </Grid>
              <Grid item xs={12} sm={6}>
                <TextField
                  type="text"
                  variant="outlined"
                  disabled={true}
                  label={
                    <Typography variant="h6" component="h3">
                      Målepunkt placering
                    </Typography>
                  }
                  InputProps={{
                    style: { color: "black" },
                  }}
                  InputLabelProps={{ shrink: true }}
                  fullWidth
                  value={pejlingOutOfRange ? "" : currentMP.mp_description}
                />
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={12}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={formData.comment}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
              fullWidth
              onChange={handleCommentChange}
            />
          </Grid>
          {(isWaterlevel || isFlow) && (
            <Grid item xs={12} sm={12}>
              <FormControl component="fieldset">
                <FormLabel component="h6">
                  Hvordan skal pejlingen anvendes?
                </FormLabel>
                <RadioGroup
                  value={formData.useforcorrection + ""}
                  onChange={handleUsageChange}
                >
                  <FormControlLabel
                    value="0"
                    control={<Radio />}
                    label="Kontrol"
                  />
                  <FormControlLabel
                    value="1"
                    control={<Radio />}
                    label="Korrektion fremadrettet"
                  />
                  <FormControlLabel
                    value="2"
                    control={<Radio />}
                    label="Korrektion bagud og fremadrettet"
                  />
                </RadioGroup>
              </FormControl>
            </Grid>
          )}
          <Grid item xs={2} sm={4}></Grid>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              color="secondary"
              variant="contained"
              onClick={() => {
                handleClickSubmit();
                handleSubmit();
              }}
              disabled={pejlingOutOfRange || disableSubmit}
              startIcon={<SaveIcon />}
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              color="secondary"
              variant="contained"
              onClick={resetFormData}
            >
              Annuller
            </Button>
          </Grid>
          <Grid item xs={2} sm={4}></Grid>
        </Grid>
        <Grid item xs={2} sm={4}></Grid>
      </CardContent>
    </Card>
  );
}
