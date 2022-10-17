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
} from "@mui/material";
import "date-fns";
import OwnDatePicker from "../../components/OwnDatePicker";

import LocationForm from "../Stamdata/components/LocationForm";
import StationForm from "../Stamdata/components/StationForm";
import UdstyrForm from "../Stamdata/components/UdstyrForm";
import { getUnitHistory, takeHomeEquipment, updateStamdata } from "../../api";
import { StamdataContext } from "../../state/StamdataContext";
import AddUdstyrForm from "../Stamdata/AddUdstyrForm";
import Snackbar from "@mui/material/Snackbar";
import MuiAlert from '@mui/material/Alert';
import SaveIcon from "@mui/icons-material/Save";
import moment from "moment";

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
          <Typography>Udstyr</Typography>
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

  return (
    <div>
      <Container fixed>
        <Typography variant="h6" component="h3">
          Stamdata
        </Typography>
        <Typography>Lokalitet</Typography>
        <LocationForm />
        <Typography>Station</Typography>
        <StationForm />

        <UdstyrReplace
          stationId={stationId}
          selected={selectedUnit}
          setselected={setSelectedUnit}
          trigger={triggerHistory}
        />
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
