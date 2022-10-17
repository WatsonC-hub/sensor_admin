import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { useTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import LocationContext from "../../state/LocationContext";
import Station from "./Station";
import { getStations } from "../../api";
import MinimalSelect from "../Location/MinimalSelect";
import { useParams, useHistory } from "react-router-dom";
import { StamdataProvider } from "../../state/StamdataContext";

export default function LocationDrawer() {
  // const classes = useStyles();
  const [open, setOpen] = useState(false);
  const [formToShow, setFormToShow] = useState(null);
  const [currStation, setCurrStation] = useState(null);
  const [stationList, setStationList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [selectedLocid, setSelectedLocid] = useState(-1);
  const context = useContext(LocationContext);

  const theme = useTheme();
  const params = useParams();
  const history = useHistory();

  const currentStation = (id, stations) => {
    if (stations.length === 0) return null;
    return stations.find((s) => s.ts_id + "" === id + "");
  };

  useEffect(() => {
    let locId = params.locid;
    let statId = params.statid;
    if (statId) {
      setSelectedItem(parseInt(statId));
    }
    getStations(locId, sessionStorage.getItem("session_id")).then((res) => {
      if (!statId) {
        statId = -1;
        if (res.data.res.length === 1) {
          setCurrStation(res.data.res[0]);
          statId = res.data.res[0].ts_id;
          history.replace(`/location/${locId}/${statId}`);
        }
        setSelectedItem(parseInt(statId));
      } else {
        setCurrStation(currentStation(statId, res.data.res));
      }
      setStationList(res.data.res);
    });
    setSelectedLocid(locId);
  }, [context.locationId]);

  return (
    <div>
      <CssBaseline />
      <AppBar
        position="fixed"
        style={{ backgroundColor: theme.palette.primary }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={(e) => history.push("/")}
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <MinimalSelect
            locid={selectedLocid}
            stationList={stationList}
            selectedStation={selectedItem}
            setSelectedItem={setSelectedItem}
            setCurrStation={setCurrStation}
            currentStation={currStation}
          />
        </Toolbar>
      </AppBar>

      <main
        style={{
          flexGrow: 1,
          padding: theme.spacing(3),
        }}
      >
        <div />
        <StamdataProvider>
          <Station
            open={open}
            stationId={currStation ? currStation.ts_id : -1}
            formToShow={formToShow}
            setFormToShow={setFormToShow}
          />
        </StamdataProvider>
      </main>
    </div>
  );
}
