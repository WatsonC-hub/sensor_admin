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
import { StamdataContext, StamdataProvider } from "./StamdataContext";
import { getStamData, getStationTypes, postStamdata } from "../../api";
import { useQuery } from "react-query";
import UdstyrForm from "./components/UdstyrForm";

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

            // setValues("udstyr", {
            //   terminal: locData.terminal_type,
            //   terminalid: locData.terminal_id,
            //   sensorid: locData.sensor_id,
            //   sensorinfo: locData.sensorinfo,
            //   parameter: locData.tstype_name,
            //   calypso_id: locData.calypso_id,
            //   batteriskift: locData.batteriskift,
            //   startdato: locData.startdato,
            //   slutdato: locData.slutdato,
            //});
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
    // const flex = {
    //   display: "flex",
    //   alignItems: "baseline",
    //   justifyContent: "space-between",
    // };

    // const [
    //   locality,
    //   setLocality,
    //   formData,
    //   setFormData,
    //   setValues,
    //   setLocationValue,
    //   setStationValue,
    //   setUdstyrValue,
    // ] = React.useContext(StamdataContext);

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


function Udstyr(props) {
    const [, , formData, , setValues, , , setUdstyrValue] =
        React.useContext(StamdataContext);

    return (
        <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
            <Grid container spacing={2}>
                <Grid item xs={12} sm={6}>
                    <TextField
                        InputProps={{
                            readOnly: true,
                        }}
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
                        InputProps={{
                            readOnly: true,
                        }}
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
                        InputProps={{
                            readOnly: true,
                        }}
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
                        InputProps={{
                            readOnly: true,
                        }}
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
                        InputProps={{
                            readOnly: true,
                        }}
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
                    <TextField
                        InputProps={{
                            readOnly: true,
                        }}
                        variant='outlined'
                        type='text'
                        label='Startdato'
                        value={
                            formData.udstyr.startdato
                                ? new Date(formData.udstyr.startdato)
                                    .toISOString()
                                    .split("T")[0]
                                : ""
                        }
                        InputLabelProps={{ shrink: true }}
                        fullWidth
                        margin='dense'
                    />
                </Grid>
            </Grid>
        </MuiPickersUtilsProvider>
    );
}

export default function RetStamdata({ setAddStationDisabled }) {
    const history = useHistory();
    const [ustyrDialogOpen, setUdstyrDialogOpen] = React.useState(false);
    const [locationDialogOpen, setLocationDialogOpen] = React.useState(false);
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
                //saveUdstyrFormData={saveUdstyrFormData}
                tstype_id={selectedStationType}
            />
            <AddLocationForm
                locationDialogOpen={locationDialogOpen}
                setLocationDialogOpen={setLocationDialogOpen}
            //saveLocationFormData={saveLocationFormData}
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
                            Annuller
                        </Button>
                    </Grid>
                </Grid>
            </Container>
        </div>
        // </StamdataProvider>
    );
}
