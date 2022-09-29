import React, { useEffect, useState } from "react";
import { useHistory } from "react-router-dom";
import {
  Container,
  Grid,
  Typography,
  Button,
  TextField,
} from "@material-ui/core";
import Autocomplete from "@material-ui/lab/Autocomplete";
import "date-fns";
import _ from "lodash";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import AddUdstyrForm from "./AddUdstyrForm";
import AddLocationForm from "./AddLocationForm";
import LocationForm from "./components/LocationForm";
import StationForm from "./components/StationForm";
import { StamdataContext } from "../../state/StamdataContext";
import { getStamData, postStamdata } from "../../api";
import UdstyrForm from "./components/UdstyrForm";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import SaveIcon from "@material-ui/icons/Save";
import moment from "moment";
import stamdataStore from "../../state/store";
import { useQuery } from "@tanstack/react-query";

const flex1 = {
  display: "flex",
  alignItems: "baseline",
  justifyContent: "start",
};

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

function LocationChooser({ setLocationDialogOpen }) {
  const [setLocation, resetLocation] = stamdataStore((store) => [
    store.setLocation,
    store.resetLocation,
  ]);

  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  const populateFormData = (locData) => {
    if (locData) {
      setLocation({
        loc_id: locData.loc_id,
        loc_name: locData.loc_name,
        mainloc: locData.mainloc,
        subloc: locData.subloc,
        subsubloc: locData.subsubloc,
        x: locData.x,
        y: locData.y,
        terrainqual: locData.terrainqual,
        terrainlevel: locData.terrainlevel,
        description: locData.description,
        loctype_id: locData.loctype_id,
      });
    } else {
      resetLocation();
    }
  };

  const { data: locations } = useQuery(["locations"], getStamData, {
    select: (data) => _.uniqBy(data, "loc_id"),
  });

  const desktopChooser = (
    <>
      <Grid item xs={12} sm={6}>
        <div style={flex1}>
          <Typography>Lokation</Typography>

          <Autocomplete
            options={locations}
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
            onChange={(event, value) => populateFormData(value)}
          />

          <Button
            size="small"
            color="secondary"
            variant="contained"
            style={{
              textTransform: "none",
              marginLeft: "12px",
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj ny lokation
          </Button>
        </div>
      </Grid>
      {/* <Grid item xs={12} sm={6}></Grid> */}
    </>
  );

  const mobileChooser = (
    <>
      <Grid item xs={12}>
        <div style={flex1}>
          <Autocomplete
            options={locations}
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
            disableClearable
            style={{ width: 200 }}
            onChange={(event, value) => populateFormData(value)}
          />
          <Button
            color="secondary"
            variant="contained"
            style={{
              textTransform: "none",
            }}
            onClick={() => setLocationDialogOpen(true)}
          >
            Tilføj lokation
          </Button>
        </div>
      </Grid>
    </>
  );

  return matches ? mobileChooser : desktopChooser;
}

function Location({ setLocationDialogOpen }) {
  return (
    <Grid container>
      <LocationChooser setLocationDialogOpen={setLocationDialogOpen} />
      <LocationForm />
    </Grid>
  );
}

export default function OpretStamdata({ setAddStationDisabled }) {
  const history = useHistory();
  const [udstyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
  const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);

  // const [, , formData, , , , , , saveUdstyrFormData] =
  //   React.useContext(StamdataContext);

  const store = stamdataStore();

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
    store.resetUnit();
  };

  const handleSubmit = () => {
    setAddStationDisabled(false);
    let form = {
      location: {
        ...store.location,
      },
      station: {
        ...store.timeseries,
        mpstartdate: moment(store.unit.startdato).format("YYYY-MM-DD"),
      },
      udstyr: {
        ...store.unit,
      },
    };
    postStamdata(form)
      .then((res) => {
        setSeverity("success");
        setOpenAlert(true);
        setTimeout(() => {
          history.push("/");
        }, 1500);
      })
      .catch((error) => {
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
        udstyrDialogOpen={udstyrDialogOpen}
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

        <Location setLocationDialogOpen={setLocationDialogOpen} />
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
              textTransform: "none",
              marginLeft: "12px",
            }}
            color="secondary"
            variant="contained"
            onClick={() => setUdstyrDialogOpen(true)}
          >
            {store.unit.calypso_id === "" ? "Tilføj Udstyr" : "Ændre udstyr"}
          </Button>
        </div>
        <UdstyrForm mode="add" />
        <Grid container spacing={3}>
          <Grid item xs={4} sm={2}>
            <Button
              color="secondary"
              variant="contained"
              onClick={handleSubmit}
              startIcon={<SaveIcon />}
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              color="secondary"
              variant="contained"
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
          {severity === "success"
            ? "Oprettelse af station lykkedes"
            : "Oprettelse af station fejlede"}
        </Alert>
      </Snackbar>
    </div>
  );
}
