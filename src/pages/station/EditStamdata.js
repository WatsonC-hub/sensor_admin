import React, { useEffect } from "react";
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
} from "@material-ui/core";
import "date-fns";
import DateFnsUtils from "@date-io/date-fns";
import daLocale from "date-fns/locale/da";
import {
  MuiPickersUtilsProvider,
  KeyboardDateTimePicker,
} from "@material-ui/pickers";

import LocalityForm from "../Stamdata/components/LocalityForm";
import StationForm from "../Stamdata/components/StationForm";
import UdstyrForm from "../Stamdata/components/UdstyrForm";
import { getStamdataByStation, getUnitHistory } from "../../api";
import { StamdataContext } from "../Stamdata/StamdataContext";

const UnitEndDateDialog = () => {
  return (
    <MuiPickersUtilsProvider utils={DateFnsUtils} locale={daLocale}>
      <Dialog>
        <DialogTitle>Set slutdato</DialogTitle>
        <DialogContent>
          <KeyboardDateTimePicker
            disableToolbar
            variant="inline"
            inputProps={{ readOnly: true }}
            format="yyyy-MM-dd"
            margin="normal"
            id="Fra"
            label={
              <Typography variant="h6" component="h3">
                Fra
              </Typography>
            }
            InputLabelProps={{ shrink: true }}
            value={new Date()}
            onChange={(date) => {}}
            KeyboardButtonProps={{
              "aria-label": "change date",
            }}
            fullWidth
          />
          <TextField
            InputProps={{
              readOnly: false,
            }}
            variant="outlined"
            type="text"
            label="Kommentar"
            value=""
            onChange={(event) => {}}
            InputLabelProps={{ shrink: true }}
            fullWidth
            margin="dense"
          />
        </DialogContent>
      </Dialog>
    </MuiPickersUtilsProvider>
  );
};

const UdStyrReplace = ({ stationId }) => {
  const [unit, setUnit] = React.useState(0);
  const handleChange = (event) => {
    setUnit(event.target.value);
  };
  const flex1 = {
    display: "flex",
    alignItems: "baseline",
    justifyContent: "space-between",
  };

  const [data, setData] = React.useState([]);
  useEffect(() => {
    getUnitHistory(stationId).then((res) => {
      if (res.data.success) {
        setData(res.data.data);
        setUnit(res.data.data[0].gid);
      }
    });
  }, [stationId]);

  return (
    <Grid container spacing={2}>
      <Grid item xs={6} sm={6}>
        <div style={flex1}>
          <Typography>Udstyr</Typography>
          <Select value={unit} onChange={handleChange}>
            <MenuItem value={0}>Ingen udstyr</MenuItem>
            {data.map((item) => {
              let endDate =
                new Date() < new Date(item.enddate) ? "nu" : item.enddate;

              return (
                <MenuItem key={item.gid} value={item.gid}>
                  {`${item.startdate} - ${endDate}`}
                </MenuItem>
              );
            })}
          </Select>
        </div>
      </Grid>
      <Grid item xs={6} sm={6}>
        <Button style={{ backgroundColor: "#4472c4" }} onClick={() => {}}>
          Hjemtag udstyr
        </Button>
      </Grid>
    </Grid>
  );
};

export default function EditStamdata({ setFormToShow, stationId }) {
  const [
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    ,
    saveUdstyrFormData,
    saveLocationFormData,
    saveStationFormData,
  ] = React.useContext(StamdataContext);

  useEffect(() => {
    /*
    -get stamdata. choose the one corresponding to stationId.
    set that to formData.
     */
    getStamdataByStation(stationId).then((res) => {
      //let st = res.data.data.find((s) => s.ts_id === props.stationId);
      if (res.data.success) {
        saveLocationFormData(res.data.data);
        saveUdstyrFormData(res.data.data);
        saveStationFormData(res.data.data);
      }
    });
  }, [stationId]);

  /*
  TODO:
  1. save data
  2. Error handling if no data
  3. hjemmetage udstyr component
  4. Skift batteri
  5. show that data is loading (login, dropdown .... ) 
  */
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

        <UdStyrReplace stationId={stationId} />
        <UdstyrForm />
        <Grid container spacing={3}>
          <Grid item xs={4} sm={2}>
            <Button
              autoFocus
              style={{ backgroundColor: "#ffa137" }}
              onClick={() => {
                setFormToShow(null);
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
                setFormToShow(null);
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
