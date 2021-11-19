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
import {
  getStamData,
  getStationTypes,
  postStamdata,
  getUnitHistory,
} from "../../api";
import { useQuery } from "react-query";
import UdstyrForm from "./components/UdstyrForm";

const UdStyrReplace = ({ stationId }) => {
  const [unit, setUnit] = useState(0);
  const handleChange = (event) => {
    setUnit(event.target.value);
  };
  const [data, setData] = useState([]);
  useEffect(() => {
    getUnitHistory(stationId).then((res) => {
      if (res.data.success) setData(res.data.data);
    });
  }, [stationId]);

  return (
    <>
      <Grid item xs={6} sm={6}>
        <Select value={0}>
          <MenuItem value={0}>Ingen udstyr</MenuItem>
          {data.map((item) => (
            <MenuItem key={item.unit_uuid} value={item.unit_uuid}>
              {`${item.startdate} - ${item.enddate}`}
            </MenuItem>
          ))}
        </Select>
      </Grid>
      <Grid item xs={6} sm={6}>
        <Button style={{ backgroundColor: "#4472c4" }} onClick={() => {}}>
          Hjemtag udstyr
        </Button>
      </Grid>
    </>
  );
};

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
      <UdStyrReplace stationId={1} />
      <UdstyrForm mode='edit' />
    </Container>
  );
}
