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
  makeStyles,
  useMediaQuery,
  FormLabel,
  useTheme,
} from "@material-ui/core";
import { isValid } from "date-fns";
import { InputAdornment } from "@material-ui/core";
import moment from "moment";
import SaveIcon from "@material-ui/icons/Save";
import OwnDatePicker from "./OwnDatePicker";
import { Checkbox } from "@material-ui/core";
import { Tooltip } from "@material-ui/core";
import { StamdataContext } from "../pages/Stamdata/StamdataContext";
import Box from "@material-ui/core/Box";

const useStyles = makeStyles({
  root: {
    width: "60%",
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
    marginLeft: "20%",
  },
  mobile: {
    width: "100%",
    textAlign: "center",
    justifyContent: "center",
    alignContent: "center",
  },
});

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
  const classes = useStyles();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
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

  const [, , stamdata, , , , , , , , ,] = React.useContext(StamdataContext);

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
    <Card
      style={{ marginBottom: 25 }}
      className={matches ? classes.mobile : classes.root}
    >
      <CardContent>
        <Typography gutterBottom variant="h5" component="h2">
          {formData.gid !== -1 ? "Opdater kontrol" : "Indberet kontrol"}
        </Typography>
        <Grid container spacing={3} alignItems="center" justify="center">
          <Grid item xs={12} sm={12}>
            <Tooltip title="f.eks. tør eller tilfrossen">
              <FormControlLabel
                control={<Checkbox onChange={handleNotPossibleChange} />}
                label="Måling ikke mulig"
              />
            </Tooltip>
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              type="number"
              variant="outlined"
              label={
                <Typography variant="h5" component="h3">
                  {isWaterlevel ? "Pejling (nedstik)" : "Måling"}
                </Typography>
              }
              InputProps={{
                endAdornment: (
                  <InputAdornment position="start">
                    {isWaterlevel ? "m" : stamdata.station.unit}
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
        </Grid>
        <Grid container spacing={3} alignItems="center" justify="center">
          {isWaterlevel && (
            <>
              <Grid item xs={12} sm={8}>
                <Box p={0} border={1} borderRadius={8} borderColor="gray">
                  <p>Målepunkt placering: {currentMP.mp_description}</p>
                </Box>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={6}>
            <OwnDatePicker
              label={
                <Typography variant="h6" component="h3">
                  Tidspunkt for måling
                </Typography>
              }
              value={new Date(formData.timeofmeas)}
              onChange={(date) => handleDateChange(date)}
              error={pejlingOutOfRange}
              helperText={
                pejlingOutOfRange ? "Dato ligger uden for et målepunkt" : ""
              }
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
          {isWaterlevel && (
            <>
              <Grid item xs={12} sm={6}>
                <Box p={0} border={1} borderRadius={8} borderColor="gray">
                  <p>
                    Målepunktskote:{" "}
                    {pejlingOutOfRange ? "" : currentMP.elevation}
                  </p>
                </Box>
              </Grid>
            </>
          )}
          <Grid item xs={12} sm={10}>
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
        </Grid>
      </CardContent>
    </Card>
  );
}
