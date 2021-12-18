import React, { useEffect, useState } from "react";
import {
  Container,
  Grid,
  Typography,
  TextField,
  Button,
  Select,
  MenuItem,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  useTheme,
} from "@material-ui/core";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import { MuiPickersUtilsProvider } from "@material-ui/pickers";
import OwnDatePicker from "../../components/OwnDatePicker";

import LocalityForm from "../Stamdata/components/LocalityForm";
import StationForm from "../Stamdata/components/StationForm";
import UdstyrForm from "../Stamdata/components/UdstyrForm";
import {
  getStamdataByStation,
  getUnitHistory,
  takeHomeEquipment,
  updateStamdata,
} from "../../api";
import { StamdataContext } from "../Stamdata/StamdataContext";
import AddUdstyrForm from "../Stamdata/AddUdstyrForm";
import Snackbar from "@material-ui/core/Snackbar";
import MuiAlert from "@material-ui/lab/Alert";
import SaveIcon from "@material-ui/icons/Save";

function formatedTimestamp(d) {
  const date = d.toISOString().split("T")[0];
  const time = d.toTimeString().split(" ")[0];
  return `${date} ${time}`;
}

function Alert(props) {
  return <MuiAlert elevation={6} variant="filled" {...props} />;
}

const UnitEndDateDialog = ({
  openDialog,
  setOpenDialog,
  unit,
  setUnit,
  stationId,
}) => {
  const [date, setdate] = useState(new Date());
  const handleDateChange = (date) => {
    setdate(date);
    setUnit({
      ...unit,
      slutdato: date,
    });
  };

  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
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
                const payload = { ...unit, ts_id: stationId };
                payload.startdate = formatedTimestamp(
                  new Date(Date.parse(payload.startdato))
                );
                payload.enddate = formatedTimestamp(
                  new Date(Date.parse(payload.slutdato))
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
              autoFocus
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
    </MuiPickersUtilsProvider>
  );
};

const UdstyrReplace = ({ stationId }) => {
  // const [unit, setUnit] = useState({ gid: 0 });
  const [latestUnit, setLatestUnit] = useState({ gid: 0 });
  const [selected, setselected] = useState(-1);
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
    getUnitHistory(stationId).then((res) => {
      if (res.data.success) {
        console.log(res.data.data);
        setData(res.data.data);
        // setUnit(res.data.data[0]);
        setLatestUnit(res.data.data[0]);
        setselected(res.data.data[0].gid);
      }
    });
  }, [stationId, openDialog]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <div style={flex1}>
          <Typography>Udstyr</Typography>
          <Select value={selected} onChange={handleChange}>
            {data.map((item) => {
              let endDate =
                new Date() < new Date(item.slutdato)
                  ? "nu"
                  : formatedTimestamp(new Date(item.slutdato));

              return (
                <MenuItem key={item.gid} value={item.gid}>
                  {`${formatedTimestamp(
                    new Date(item.startdato)
                  )} - ${endDate}`}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </Grid>
      <Grid item xs={12} sm={6}>
        {latestUnit.slutdato > "2098-01-01" ? (
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
        setUnit={setLatestUnit}
        stationId={stationId}
      />
      <AddUdstyrForm
        udstyrDialogOpen={openAddUdstyr}
        setUdstyrDialogOpen={setOpenAddUdstyr}
        tstype_id={formData.station.tstype_id}
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
  const theme = useTheme();
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");

  const handleSubmit = () => {
    updateStamdata(formData, sessionStorage.getItem("session_id"))
      .then((res) => {
        console.log(res);
        setSeverity("success");
        setOpenAlert(true);
        setTimeout(() => {}, 1500);
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
      <Container fixed>
        <Typography variant="h6" component="h3">
          Stamdata
        </Typography>
        <Typography>Lokalitet</Typography>
        <LocalityForm />
        <Typography>Station</Typography>
        <StationForm />

        <UdstyrReplace stationId={stationId} />
        <UdstyrForm mode={"edit"} />
        <Grid container spacing={3}>
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
              autoFocus
              color="secondary"
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
