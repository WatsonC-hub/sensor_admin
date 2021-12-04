import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  InputLabel,
  Select,
  MenuItem,
  FormControl,
} from "@material-ui/core";
import "date-fns";
//import DateFnsUtils from "@date-io/date-fns";
//import daLocale from "date-fns/locale/da";
//import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import AddUdstyrForm from "./AddUdstyrForm";
import AddLocationForm from "./AddLocationForm";
import LocalityForm from "./components/LocalityForm";
import StationForm from "./components/StationForm";
import { StamdataContext } from "./StamdataContext";
import { getStamData, postStamdata } from "../../api";
import UdstyrForm from "./components/UdstyrForm";

const flex1 = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "start",
};

function LocationChooser({ setLocationDialogOpen }) {
  const flex = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  };

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));
  const [location] = React.useState(0);
  const [localities, setLocalities] = React.useState([]);
  const [locality, setLocality, formData, , setValues, , , ,] =
    React.useContext(StamdataContext);
  console.log("context locality: " + locality);
  const locationNames = (features) => {
    const names = features.map((l) => l.loc_name);
    return [...new Set(names)];
  };

  const populateFormData = (features, locname) => {
    const locData = features.find((f) => f.loc_name === locname);
    console.log(locname, locData);
    if (locData) {
      setValues("location", {
        locid: locData.loc_id,
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

  return matches ? mobileChooser : desktopChooser;
}

function Locality({ locationDialogOpen, setLocationDialogOpen }) {
  return (
    <Grid container spacing={2}>
      <LocationChooser
        locationDialogOpen={locationDialogOpen}
        setLocationDialogOpen={setLocationDialogOpen}
      />
      <LocalityForm />
    </Grid>
  );
}

export default function OpretStamdata({ setAddStationDisabled }) {
  const history = useHistory();
  const [ustyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);
  const [, , formData, , , , , , saveUdstyrFormData] =
    React.useContext(StamdataContext);

  const [selectedStationType, setSelectedStationType] = useState(-1);

  const changeSelectedStationType = (selectedType) => {
    if (selectedType !== selectedStationType) {
      resetUdStyrForm();
    }
    setSelectedStationType(selectedType);
  };

  const resetUdStyrForm = () => {
    saveUdstyrFormData({
      terminal: "",
      terminalid: "",
      sensorid: "",
      sensorinfo: "",
      parameter: "",
      calypso_id: "",
      batteriskift: "",
      startdato: "",
      slutdato: "",
    });
  };

  return (
    <div>
      <AddUdstyrForm
        ustyrDialogOpen={ustyrDialogOpen}
        setUdstyrDialogOpen={setUdstyrDialogOpen}
        tstype_id={selectedStationType}
      />
      <AddLocationForm
        locationDialogOpen={locationDialogOpen}
        setLocationDialogOpen={setLocationDialogOpen}
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
        <StationForm
          mode='add'
          selectedStationType={selectedStationType}
          setSelectedStationType={changeSelectedStationType}
        />
        <div style={flex1}>
          <Typography>Udstyr</Typography>
          <Button
            disabled={selectedStationType === -1}
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
        <UdstyrForm mode='add' />
        <Grid container spacing={3}>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: "#ffa137" }}
              onClick={() => {
                history.push("/");
                setAddStationDisabled(false);
                postStamdata(formData);
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
                setAddStationDisabled(false);
              }}
            >
              Annullere
            </Button>
          </Grid>
        </Grid>
      </Container>
    </div>
  );
}
