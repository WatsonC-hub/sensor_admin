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
import * as locations from "./location-data";
import { StamdataContext } from "./StamdataContext";
import { getStamData, getStationTypes } from "../../api";
import { useQuery } from "react-query";

const useStyles = makeStyles((theme) => ({
  root: {
    width: "100%",
  },
  heading: {
    fontSize: theme.typography.pxToRem(15),
    flexBasis: "33.33%",
    flexShrink: 0,
  },
  secondaryHeading: {
    fontSize: theme.typography.pxToRem(15),
    color: theme.palette.text.secondary,
  },
}));

const flex1 = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "start",
};

function LocationChooser({ locationDialogOpen, setLocationDialogOpen }) {
  const flex = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [location, setLocatition] = React.useState(0);
  const [localities, setLocalities] = React.useState([]);
  const [
    locality,
    setLocality,
    formData,
    setFormData,
    setValues,
    setLocationValue,
    setStationValue,
    setUdstyrValue,
  ] = React.useContext(StamdataContext);
  console.log("context locality: " + locality);
  //console.log(locations.default.data);
  const locationNames = (features) => {
    const names = features.map((l) => l.loc_name);
    return [...new Set(names)];
  };
  //const locationItems = [];

  const populateFormData = (features, locname) => {
    const locData = features.find((f) => f.loc_name === locname);
    console.log(locname, locData);
    if (locData) {
      setValues("location", {
        locname: locData.loc_name,
        mainloc: locData.mainloc,
        subloc: locData.subloc,
        subsubloc: locData.subsubloc,
        x: locData.x,
        y: locData.y,
        terrainqual: locData.terrainqual,
        terrainlevel: locData.terrainlevel,
        description: "",
      });

      setValues("udstyr", {
        terminal: locData.terminal_type,
        terminalid: locData.terminal_id,
        sensorid: locData.sensor_id,
        sensorinfo: locData.sensorinfo,
        parameter: locData.tstype_name,
        calypso_id: locData.calypso_id,
        batteriskift: locData.batteriskift,
        startdato: locData.startdato,
        slutdato: locData.slutdato,
      });
    }
  };

  const locationItems = locationNames(localities).map((name) => (
    <MenuItem value={name}>{name}</MenuItem>
  ));

  const handleChange = (event) => {
    console.log(formData);
    setLocality(event.target.value);
    console.log("before populateformdata");
    populateFormData(localities, event.target.value);
  };

  useEffect(() => {
    getStamData().then((res) => setLocalities(res.data.data));
  }, []);

  const desktopChooser = (
    <>
      <Grid item xs={12} sm={6}>
        <div style={flex}>
          <span>Lokalitet</span>
          <Select value={locality} onChange={handleChange}>
            <MenuItem value={0}>Vælg Lokalitet</MenuItem>
            {locationItems}
          </Select>

          <Button
            style={{ backgroundColor: "#4472c4" }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj lokation
          </Button>
        </div>
      </Grid>
      <Grid item xs={12} sm={6}></Grid>
    </>
  );

  const mobileChooser = (
    <>
      <Grid item xs={6}>
        <FormControl>
          <InputLabel id='localityId'>Lokalitet</InputLabel>
          <Select value={location} onChange={handleChange}>
            <MenuItem value={0}>Vælg Lokalitet</MenuItem>
            {locationItems}
          </Select>
        </FormControl>
      </Grid>
      <Grid item xs={6}>
        <Button
          style={{ backgroundColor: "#4472c4", textTransform: "none" }}
          onClick={() => setLocationDialogOpen(true)}
        >
          Tilføj lokation
        </Button>
      </Grid>
    </>
  );

  const mobileChooser1 = (
    <>
      <Grid item xs={12}>
        <div style={flex}>
          <Typography id='localityId'>Lokalitet</Typography>
          <Button
            size='small'
            style={{ backgroundColor: "#4472c4", textTransform: "none" }}
          >
            Tilføj lokation
          </Button>
        </div>
      </Grid>
      <Grid item xs={12}>
        <TextField
          fullWidth
          select
          label=''
          labelId='localityId'
          value={"none"}
          variant='outlined'
        >
          <MenuItem value={"none"}>
            Gyrup2– kalundborg kommune - Danmark
          </MenuItem>
          <MenuItem value={"one"}>one</MenuItem>
          <MenuItem value={"two"}>two</MenuItem>
          <MenuItem value={"three"}>three</MenuItem>
        </TextField>
      </Grid>
    </>
  );

  return matches ? mobileChooser1 : desktopChooser;
}

function Locality({ locationDialogOpen, setLocationDialogOpen }) {
  const flex = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  };

  const [
    locality,
    setLocality,
    formData,
    setFormData,
    setValues,
    setLocationValue,
    setStationValue,
    setUdstyrValue,
  ] = React.useContext(StamdataContext);

  return (
    <Grid container spacing={2}>
      {/* <Grid item xs={12} sm={6}>
        <div style={flex}>
          <span>Lokalitet</span>
          <Select value={"none"}>
            <MenuItem value={"none"}>
              Gyrup2– Thisted Kommune– N2000 omr. 27
            </MenuItem>
            <MenuItem value={"one"}>one</MenuItem>
            <MenuItem value={"two"}>two</MenuItem>
            <MenuItem value={"three"}>three</MenuItem>
          </Select>

          <Button style={{ backgroundColor: "#4472c4" }}>
            Tilføj lokation
          </Button>
        </div>
      </Grid>
      <Grid item xs={12} sm={6}></Grid> */}

      <LocationChooser
        locationDialogOpen={locationDialogOpen}
        setLocationDialogOpen={setLocationDialogOpen}
      />
      {/* <Grid item xs={12} sm={12}>
        <InputLabel>Lokalitet</InputLabel>
      </Grid> */}
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Navn'
          value={formData.location.locname}
          //onChange={(event) => setLocationValue("locname", event.target.value)}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Hoved lokation'
          value={formData.location.mainloc}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Under lokation'
          value={formData.location.subloc}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Under-under lokation'
          value={formData.location.subsubloc}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='X-koordinat (UTM)'
          value={formData.location.x}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Y-koordinat (UTM)'
          value={formData.location.y}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Terrænkote'
          value={formData.location.terrainlevel}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Type af terrænkote'
          value={formData.location.terrainqual}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>

      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Kommentar'
          value={formData.location.description}
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
    </Grid>
  );
}

function StationForm(props) {
  const StationTypeSelect = (props) => {
    const [stationTypes, setStationTypes] = React.useState([]);
    const [selected, setSelected] = React.useState(-1);
    const handleSelection = (event) => {
      setSelected(event.target.value);
    };

    useEffect(() => {
      getStationTypes().then(
        (res) => res && setStationTypes(res.data.features)
      );
    }, []);

    let menuItems = stationTypes
      .filter((i) => i.properties.tstype_id !== 0)
      .map((item) => (
        <MenuItem value={item.properties.tstype_id}>
          {item.properties.tstype_name}
        </MenuItem>
      ));
    return (
      <TextField
        autoFocus
        variant='outlined'
        select
        margin='dense'
        value={selected}
        onChange={handleSelection}
        label='Sensor type'
        fullWidth
      >
        <MenuItem value={-1}>Vælg type</MenuItem>
        {menuItems}
      </TextField>
    );
  };

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Navn'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <StationTypeSelect />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label=' Målepunktskote'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
      <Grid item xs={12} sm={6}>
        <TextField
          variant='outlined'
          type='text'
          label='Evt. loggerdybde'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        />
      </Grid>
    </Grid>
  );
}

function UdstyrForm(props) {
  const [, , formData, , setValues, , , setUdstyrValue] =
    React.useContext(StamdataContext);

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Grid container spacing={2}>
        <Grid item xs={12} sm={6}>
          <TextField
            variant='outlined'
            type='text'
            id='terminal'
            value={formData.udstyr.terminal}
            label='Terminal'
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("terminal", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant='outlined'
            type='text'
            label='Terminal ID'
            value={formData.udstyr.terminalid}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("terminalid", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant='outlined'
            type='text'
            label='CALYPSO ID'
            value={formData.udstyr.calypso_id}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("calypso_id", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant='outlined'
            type='text'
            label='Sensor'
            value={formData.udstyr.parameter}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("sensorinfo", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          <TextField
            variant='outlined'
            type='text'
            label='Sensor ID'
            value={formData.udstyr.sensorid}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin='dense'
            onChange={(e) => setUdstyrValue("sensorid", e.target.value)}
          />
        </Grid>
        <Grid item xs={12} sm={6}>
          {/* <TextField
          variant='outlined'
          type='text'
          label='Startdato'
          InputLabelProps={{ shrink: true }}
          fullWidth
          margin='dense'
        /> */}
          <KeyboardDateTimePicker
            disableToolbar
            inputProps={{ readOnly: true }}
            inputVariant='outlined'
            format='yyyy-MM-dd HH:mm'
            margin='normal'
            id='date-picker-inline'
            label='Startdato'
            InputLabelProps={{ shrink: true }}
            value={formData.udstyr.startdato}
            onChange={(date) => setUdstyrValue("startdato", date)}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
            fullWidth
          />
        </Grid>
      </Grid>
    </MuiPickersUtilsProvider>
  );
}

export default function RetStamdata(props) {
  const history = useHistory();
  const [ustyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);
  const [formData, setFormData] = React.useState({
    location: {
      locname: "",
      mainloc: "",
      subloc: "",
      subsubloc: "",
      x: "",
      y: "",
      terrainqual: "",
      //terrainlevel:"",
      description: "",
    },
    station: {
      stationname: "",
      stationtypename: "",
      parameter: "",
      maalepunktskote: "",
      terrainlevel: "",
    },
    udstyr: {
      terminal: "",
      terminalid: "",
      sensorid: "",
      sensorinfo: "",
      calypso_id: "",
      batteriskift: "",
      startdato: "",
      slutdato: "",
    },
  });

  //const [formData, setFormData] = React.useState(data);

  const [locality, setLocality] = React.useState(0);

  const setLocationValue = (key, value) => {
    setFormData((formData) => ({
      ...formData,
      location: {
        ...formData.location,
        [key]: value,
      },
    }));
  };

  const setStationValue = (key, value) => {
    setFormData((formData) => ({
      ...formData,
      station: {
        ...formData.station,
        [key]: value,
      },
    }));
  };

  const setUdstyrValue = (key, value) => {
    setFormData((formData) => ({
      ...formData,
      udstyr: {
        ...formData.udstyr,
        [key]: value,
      },
    }));
  };

  const setValues = (part, keyValues) => {
    Object.keys(keyValues).forEach((k) => {
      if (part === "location") {
        setLocationValue(k, keyValues[k]);
      } else if (part === "station") {
        setStationValue(k, keyValues[k]);
      } else if (part === "udstyr") {
        setUdstyrValue(k, keyValues[k]);
      }
    });
  };

  const saveChosenUnit = (unitData) => {};

  const saveLocationFormData = (locFormData) => {};

  return (
    <StamdataContext.Provider
      value={[
        locality,
        setLocality,
        formData,
        setFormData,
        setValues,
        setLocationValue,
        setStationValue,
        setUdstyrValue,
      ]}
    >
      <div>
        <AddUdstyrForm
          ustyrDialogOpen={ustyrDialogOpen}
          setUdstyrDialogOpen={setUdstyrDialogOpen}
          saveChosenUnit={saveChosenUnit}
          tstype_id={1}
        />
        <AddLocationForm
          locationDialogOpen={locationDialogOpen}
          setLocationDialogOpen={setLocationDialogOpen}
          saveLocationFormData={saveLocationFormData}
        />
        <Container fixed>
          <Typography variant='h6' component='h3'>
            Stamdata
          </Typography>

          <Locality
            locationDialogOpen={locationDialogOpen}
            setLocationDialogOpen={setLocationDialogOpen}
          />
          <Typography>Station</Typography>
          <StationForm />
          <div style={flex1}>
            <Typography>Udstyr</Typography>
            <Button
              size='small'
              style={{
                backgroundColor: "#4472c4",
                textTransform: "none",
                marginLeft: "12px",
              }}
              onClick={() => setUdstyrDialogOpen(true)}
            >
              Tilføj Udstyr
            </Button>
          </div>
          <UdstyrForm />
          <Typography>Period</Typography>
          <Grid container spacing={3}>
            <Grid item xs={4} sm={2}>
              <Button
                autoFocus
                style={{ backgroundColor: "#ffa137" }}
                onClick={() => {
                  history.push("/");
                }}
              >
                Gem
              </Button>
            </Grid>
            <Grid item xs={4} sm={2}>
              <Button
                autoFocus
                style={{ backgroundColor: "#ffa137" }}
                onClick={() => {
                  history.push("/");
                }}
              >
                Annullere
              </Button>
            </Grid>
          </Grid>
        </Container>
      </div>
    </StamdataContext.Provider>
  );
}
