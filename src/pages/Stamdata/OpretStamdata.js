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
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import "date-fns";
import _ from "lodash";
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
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";

const flex1 = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "start",
};

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

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
        loc_id: locData.loc_id,
        loc_name: locData.loc_name,
        mainloc: locData.mainloc,
        subloc: locData.subloc,
        subsubloc: locData.subsubloc,
        x: locData.x,
        y: locData.y,
        terrainqual: locData.terrainqual,
        terrainlevel: locData.terrainlevel,
        description: "",
      });
    } else {
      setValues("location", {
        loc_id: "",
        loc_name: "",
        mainloc: "",
        subloc: "",
        subsubloc: "",
        x: "",
        y: "",
        terrainqual: "",
        terrainlevel: "",
        description: "",
      });
    }
  };

  const locationItems = locationNames(localities).map((name) => (
    <MenuItem value={name}>{name}</MenuItem>
  ));
  const loc_items = _.uniqBy(localities, "loc_id");
  console.log(loc_items);
  const handleChange = (event) => {
    const value =
      event.target.textContent === "" ? 0 : event.target.textContent;
    console.log(value);
    setLocality(value);
    console.log("before populateformdata");
    populateFormData(localities, value);
  };

  const handleClear = (event) => {};

  useEffect(() => {
    getStamData().then((res) => setLocalities(res.data.data));
  }, []);

  const desktopChooser = (
    <>
      <Grid item xs={12} sm={6}>
        <div style={flex1}>
          <Typography>Lokation</Typography>

          <Autocomplete
            options={loc_items}
            getOptionLabel={(option) => option.loc_name}
            renderInput={(params) => (
              <TextField
                {...params}
                size="small"
                variant="outlined"
                placeholder="Vælg lokalitet"
                style={{ marginTop: "-6px" }}
              />
            )}
            style={{ width: 200, marginLeft: "12px" }}
            onChange={handleChange}
          />

          <Button
            size="small"
            style={{
              backgroundColor: "#4472c4",
              textTransform: "none",
              marginLeft: "12px",
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj lokation
          </Button>
        </div>
      </Grid>
      {/* <Grid item xs={12} sm={6}></Grid> */}
    </>
  );

  const mobileChooser = (
    <>
      <Grid item xs={8}>
        {/* <InputLabel id="localityId">Lokalitet</InputLabel> */}
        <Autocomplete
          options={loc_items}
          getOptionLabel={(option) => option.loc_name}
          renderInput={(params) => (
            <TextField {...params} label="Vælg lokalitet" variant="outlined" />
          )}
          disableClearable
          onChange={handleChange}
        />
        {/* <Select value={location} onChange={handleChange}>
            <MenuItem value={0}>Vælg Lokalitet</MenuItem>
            {locationItems}
          </Select> */}
      </Grid>
      <Grid item xs={4}>
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
    <Grid container>
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

  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");

  const changeSelectedStationType = (selectedType) => {
    if (selectedType !== selectedStationType) {
      resetUdStyrForm();
    }
    setSelectedStationType(selectedType);
  };

  const resetUdStyrForm = () => {
    saveUdstyrFormData({
      terminal: "",
      terminal_id: "",
      sensor_id: "",
      sensorinfo: "",
      parameter: "",
      calypso_id: "",
      batteriskift: "",
      startdato: "",
      slutdato: "",
      uuid: "",
    });
  };

  const handleSubmit = () => {
    setAddStationDisabled(false);
    postStamdata(formData)
      .then((res) => {
        console.log(res);
        setSeverity("success");
        setOpenAlert(true);
        setTimeout(() => {}, 1500);
        history.push("/");
      })
      .catch((error) => {
        console.log(error);
        setSeverity("error");
        setOpenAlert(true);
      });

    // history.push("/");
  };

  const handleClose = (event, reason) => {
    if (reason === "clickaway") {
      return;
    }

    setOpenAlert(false);
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
        <Typography variant="h6" component="h3">
          Stamdata
        </Typography>

        <Locality
          locationDialogOpen={locationDialogOpen}
          setLocationDialogOpen={setLocationDialogOpen}
        />
        <Typography>Station</Typography>
        <StationForm
          mode="add"
          selectedStationType={selectedStationType}
          setSelectedStationType={changeSelectedStationType}
        />
        <div style={flex1}>
          <Typography>Udstyr</Typography>
          <Button
            disabled={selectedStationType === -1}
            size="small"
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
        <UdstyrForm mode="add" />
        <Grid container spacing={3}>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: "#ffa137" }}
              onClick={handleSubmit}
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
              Annuller
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={openAlert} autoHideDuration={6000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          Oprettelse af station fejlede
        </Alert>
      </Snackbar>
    </div>
  );
}
