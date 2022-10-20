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
import {
  getUnitHistory,
  takeHomeEquipment,
  updateStamdata,
  apiClient,
} from "../../api";
import AddUdstyrForm from "../Stamdata/AddUdstyrForm";
import SaveIcon from "@mui/icons-material/Save";
import moment from "moment";
import { stamdataStore } from "../../state/store";
import {
  QueryClient,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";
import axios from "axios";
import { toast } from "react-toastify";

const UnitEndDateDialog = ({
  openDialog,
  setOpenDialog,
  unit,
  setUdstyrValue,
  stationId,
}) => {
  const [date, setdate] = useState(new Date());

  const queryClient = useQueryClient();

  const handleDateChange = (date) => {
    setdate(date);
  };

  const takeHomeMutation = useMutation(
    async () => {
      const { data } = await apiClient.patch(
        `/sensor_field/stamdata/unit_history/${stationId}/${unit.gid}`,
        {
          enddate: moment(date).format("YYYY-MM-DD HH:mm"),
        }
      );
      return data;
    },
    {
      onSuccess: (data) => {
        setOpenDialog(false);
        setUdstyrValue("slutdato", moment(date).format("YYYY-MM-DD HH:mm"));
        toast.success("Udstyret er hjemtaget");
        queryClient.invalidateQueries(["udstyr", stationId]);
      },
    }
  );

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
            onClick={takeHomeMutation.mutate}
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

const UdstyrReplace = ({ stationId, selected, setselected }) => {
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
    async () => {
      const { data } = await apiClient.get(
        `/sensor_field/stamdata/unit_history/${stationId}`
      );
      return data;
    },
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
  const [selectedUnit, setSelectedUnit] = useState(-1);

  const [location, timeseries, unit] = stamdataStore((store) => [
    store.location,
    store.timeseries,
    store.unit,
  ]);

  const queryClient = useQueryClient();

  const handleSubmit = () => {
    console.log(selectedUnit);
    updateStamdata(
      { location, station: timeseries, udstyr: { ...unit, gid: selectedUnit } },
      sessionStorage.getItem("session_id")
    )
      .then((res) => {
        console.log(res);
        toast.success("Stamdata er opdateret");
        queryClient.invalidateQueries(["udstyr", stationId]);
      })
      .catch((error) => {
        toast.error("Der skete en fejl");
      });

    // history.push("/");
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
    </div>
  );
}
