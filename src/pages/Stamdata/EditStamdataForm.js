import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  InputLabel,
  Select,
  MenuItem,
  Card,
  CardContent,
  CardActions,
  Radio,
  RadioGroup,
  FormControlLabel,
  FormControl,
  FormLabel,
} from "@material-ui/core";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardTimePicker,
  KeyboardDatePicker,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";
import { makeStyles } from "@material-ui/core/styles";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import AddUdstyrForm from "./AddUdstyrForm";
import AddLocationForm from "./AddLocationForm";
import LocalityForm from "./components/LocalityForm";
import StationForm from "./components/StationForm";
import * as locations from "./location-data";
import { StamdataContext } from "./StamdataContext";
import { getStamData, getStationTypes, postStamdata } from "../../api";
import { useQuery } from "react-query";
import UdstyrForm from "./components/UdstyrForm";

export default function EditStamdataForm() {
  const [
    locality,
    setLocality,
    formData,
    setFormData,
    setValues,
    setLocationValue,
    setStationValue,
    setUdstyrValue,
    saveUdstyrFormData,
    saveLocationFormData,
  ] = React.useContext(StamdataContext);

  return (
    <Container fixed>
      <Typography variant='h6' component='h3'>
        Stamdata
      </Typography>
      <Grid container spacing={2}>
        <LocalityForm />
      </Grid>
      <StationForm mode='edit' />
      <UdstyrForm mode='edit' />
    </Container>
  );
}
