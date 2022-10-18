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
import MuiAlert from "@mui/material/Alert";
import SaveIcon from "@mui/icons-material/Save";
import moment from "moment";
import { stamdataStore } from "../../state/store";
import { useQuery } from "@tanstack/react-query";

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
  const [openDialog, setOpenDialog] = useState(false);
  const [openAddUdstyr, setOpenAddUdstyr] = useState(false);

  const [tstype_id, setUnitValue, setUnit] = stamdataStore((store) => [
    store.timeseries.tstype_id,
    store.setUnitValue,
    store.setUnit,
  ]);

  const handleChange = (event) => {
    setUnit(data.filter((elem) => elem.gid === event.target.value)[0]);
    setselected(event.target.value);
  };

  const flex1 = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  };

  const { data } = useQuery(
    ["udstyr", stationId],
    () => getUnitHistory(stationId),
    {
      onSuccess: (data) => {
        setselected(data[0].gid);
      },
    }
  );

  return (
    <Grid container spacing={2}>
      <Grid item xs={12} sm={6}>
        <div style={flex1}>
          <Typography>Udstyr</Typography>
          <Select value={selected} onChange={handleChange}>
            {data?.map((item) => {
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
        {moment(data?.[0].slutdato) > moment(new Date()) ? (
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
        unit={data?.[0]}
        setUdstyrValue={setUnitValue}
        stationId={stationId}
      />
      <AddUdstyrForm
        udstyrDialogOpen={openAddUdstyr}
        setUdstyrDialogOpen={setOpenAddUdstyr}
        tstype_id={tstype_id}
      />
    </Grid>
  );
};

export default function EditStamdata({ setFormToShow, stationId }) {
  const [, , formData, , , , ,] = React.useContext(StamdataContext);
  const [openAlert, setOpenAlert] = useState(false);
  const [severity, setSeverity] = useState("success");
  const [selectedUnit, setSelectedUnit] = useState(-1);
  const [triggerHistory, setTriggerHistory] = useState(false);

  const [location, timeseries, unit] = stamdataStore((store) => [
    store.location,
    store.timeseries,
    store.unit,
  ]);

  const handleSubmit = () => {
    console.log(selectedUnit);
    updateStamdata(
      { location, station: timeseries, udstyr: { ...unit, gid: selectedUnit } },
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
