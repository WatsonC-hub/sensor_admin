import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
  makeStyles,
  Box,
  AppBar,
  Tab,
  Tabs,
} from "@material-ui/core";
import "date-fns";
import OwnDatePicker from "../../components/OwnDatePicker";
import LocalityForm from "../Stamdata/components/LocalityForm";
import StationForm from "../Stamdata/components/StationForm";
import UdstyrForm from "../Stamdata/components/UdstyrForm";
import { getUnitHistory, takeHomeEquipment, updateStamdata } from "../../api";
import { StamdataContext } from "../Stamdata/StamdataContext";
import AddUdstyrForm from "../Stamdata/AddUdstyrForm";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import SaveIcon from "@material-ui/icons/Save";
import moment from "moment";
import PropTypes from 'prop-types';
import SwipeableViews from 'react-swipeable-views';

function TabPanel(props) {
  const { children, value, index, ...other } = props;

  return (
    <div
      role="tabpanel"
      hidden={value !== index}
      id={`full-width-tabpanel-${index}`}
      aria-labelledby={`full-width-tab-${index}`}
      {...other}
    >
      {value === index && (
        <Box p={3}>
          <Typography>{children}</Typography>
        </Box>
      )}
    </div>
  );
}

TabPanel.propTypes = {
  children: PropTypes.node,
  index: PropTypes.any.isRequired,
  value: PropTypes.any.isRequired,
};

function a11yProps(index) {
  return {
    id: `full-width-tab-${index}`,
    'aria-controls': `full-width-tabpanel-${index}`,
  };
}

const useStyles = makeStyles((theme) => ({
  root: {
    backgroundColor: theme.palette.background.paper,
    width: 500,
  },
}));

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const UnitEndDateDialog = ({
  openDialog,
  setOpenDialog,
  unit,
  setUdstyrValue,
  stationId,
}) => {
  const [date, setdate] = useState(new Date());

  const handleDateChange = (date) => {
    setdate(date);
  };

  return (
    <Dialog open={openDialog}>
      <DialogTitle>Angiv slutdato</DialogTitle>
      <DialogContent>
        <OwnDatePicker
          label="Fra"
          value={date}
          onChange={(date) => handleDateChange(date)}
        />
        <DialogActions item xs={4} sm={2}>
          <Button
            autoFocus
            color="secondary"
            variant="contained"
            startIcon={<SaveIcon />}
            onClick={() => {
              const payload = { ...unit, ts_id: stationId, slutdato: date };
              payload.startdate = moment(payload.startdato).format(
                "YYYY-MM-DD HH:mm"
              );

              setUdstyrValue(
                "slutdato",
                moment(date).format("YYYY-MM-DD HH:mm")
              );

              takeHomeEquipment(
                unit.gid,
                payload,
                sessionStorage.getItem("session_id")
              ).then((res) => setOpenDialog(false));
            }}
          >
            Gem
          </Button>
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setOpenDialog(false);
            }}
          >
            Annuller
          </Button>
        </DialogActions>
      </DialogContent>
    </Dialog>
  );
};

const UdstyrReplace = ({ stationId, selected, setselected, trigger }) => {
  // const [unit, setUnit] = useState({ gid: 0 });
  const [latestUnit, setLatestUnit] = useState({
    gid: 0,
    slutdato: "2099-01-01",
  });
  // const [selected, setselected] = useState(-1);
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);

  const handleChange = (event) => {
    // setUnit(data.filter((elem) => elem.gid === event.target.value)[0]);
    setselected(event.target.value);
    saveUdstyrFormData(
      data.filter((elem) => elem.gid === event.target.value)[0]
    );
  };

  const [, , formData, , , , , setUdstyrValue, saveUdstyrFormData] =
    React.useContext(StamdataContext);

  const flex1 = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  };

  const [data, setData] = useState([]);

  useEffect(() => {
    console.log("RUN");
    console.log(stationId);
    if (stationId !== -1) {
      getUnitHistory(stationId).then((res) => {
        if (res.data.success) {
          console.log(res.data.data);
          setData(res.data.data);
          setLatestUnit(res.data.data[0]);
          setselected(res.data.data[0].gid);
        }
      });
    }
  }, [stationId, openDialog, trigger]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <div style={flex1}>
          {/* <Typography>Udstyr</Typography> */}
          <Select value={selected} onChange={handleChange}>
            {data.map((item) => {
              let endDate =
                moment(new Date()) < moment(item.slutdato)
                  ? "nu"
                  : moment(item.slutdato).format("YYYY-MM-DD HH:mm");

              return (
                <MenuItem key={item.gid} value={item.gid}>
                  {`${moment(item.startdato).format(
                    "YYYY-MM-DD HH:mm"
                  )} - ${endDate}`}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </Grid>
      <Grid item xs={12} sm={6}>
        {moment(latestUnit.slutdato) > moment(new Date()) ? (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setOpenDialog(true);
            }}
          >
            Hjemtag udstyr
          </Button>
        ) : (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              setOpenAddUdstyr(true);
            }}
          >
            Tilføj udstyr
          </Button>
        )}
      </Grid>
      <UnitEndDateDialog
        openDialog={openDialog}
        setOpenDialog={setOpenDialog}
        unit={latestUnit}
        setUdstyrValue={setUdstyrValue}
        stationId={stationId}
      />
      <AddUdstyrForm
        udstyrDialogOpen={openAddUdstyr}
        setUdstyrDialogOpen={setOpenAddUdstyr}
        tstype_id={formData.station.tstype_id}
        setSelectedUnit={setselected}
      />
    </Grid>
  );
};

export default function EditStamdata({ setFormToShow, stationId }) {
  /*
  TODO:
  1. save data
  2. Error handling if no data
  3. hjemmetage udstyr component
  4. Skift batteri
  5. show that data is loading (login, dropdown .... ) 
  */
  const [, , formData, , , , ,] = React.useContext(StamdataContext);
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [selectedUnit, setSelectedUnit] = useState(-1);
  const [triggerHistory, setTriggerHistory] = useState(false);
  const classes = useStyles();
  const theme = useTheme();
  const [value, setValue] = React.useState(0);

  const handleSubmit = () => {
    console.log(selectedUnit);
    updateStamdata(
      { ...formData, udstyr: { ...formData.udstyr, gid: selectedUnit } },
      sessionStorage.getItem("session_id")
    )
      .then((res) => {
        console.log(res);
        setSeverity("success");
        setOpenAlert(true);
        setTimeout(() => {}, 1500);
        setTriggerHistory(!triggerHistory);
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

  const handleChange = (event, newValue) => {
    setValue(newValue);
  };

  const handleChangeIndex = (index) => {
    setValue(index);
  };

  return (
    <div>
      <Container fixed>
        <Typography variant="h6" component="h3" style={{marginBottom: "5px"}}>
          Stamdata
        </Typography>
        <AppBar position="static" color="default">
        <Tabs
          value={value}
          onChange={handleChange}
          indicatorColor="primary"
          textColor="primary"
          variant="fullWidth"
          aria-label="full width tabs example"
        >
          <Tab label="Lokalitet" {...a11yProps(0)} />
          <Tab label="Station" {...a11yProps(1)} />
          <Tab label="Udstyr" {...a11yProps(2)} />
        </Tabs>
      </AppBar>
      <SwipeableViews
        axis={theme.direction === 'rtl' ? 'x-reverse' : 'x'}
        index={value}
        onChangeIndex={handleChangeIndex}
      >
        <TabPanel value={value} index={0} dir={theme.direction}>
          {/* <Typography>Lokalitet</Typography> */}
          <LocalityForm />
        </TabPanel>
        <TabPanel value={value} index={1} dir={theme.direction}>
          {/* <Typography>Station</Typography> */}
          <StationForm />
        </TabPanel>
        <TabPanel value={value} index={2} dir={theme.direction}>
          <UdstyrReplace
            stationId={stationId}
            selected={selectedUnit}
            setselected={setSelectedUnit}
            trigger={triggerHistory}
          />
          <UdstyrForm mode={"edit"} />
        </TabPanel>
      </SwipeableViews>
        <Grid container spacing={3} alignItems="center" justify="center">
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              color="secondary"
              variant="contained"
              startIcon={<SaveIcon />}
              onClick={handleSubmit}
            >
              Gem
            </Button>
          </Grid>
          <Grid item xs={4} sm={2}>
            <Button
              color="grey"
              variant="contained"
              onClick={() => {
                setFormToShow(null);
              }}
            >
              Annuller
            </Button>
          </Grid>
        </Grid>
      </Container>
      <Snackbar open={openAlert} autoHideDuration={4000} onClose={handleClose}>
        <Alert onClose={handleClose} severity={severity}>
          {severity === "success"
            ? "Opdatering af station lykkedes"
            : "Opdatering af station fejlede"}
        </Alert>
      </Snackbar>
    </div>
  );
}
