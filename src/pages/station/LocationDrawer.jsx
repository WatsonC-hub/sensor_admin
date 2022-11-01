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
import { useParams, useNavigate } from "react-router-dom";
import { useQuery } from "@tanstack/react-query";

export default function LocationDrawer() {
  const [selectedItem, setSelectedItem] = useState("");

  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();

  const { data } = useQuery(
    ["stations", params.locid],
    () => getStations(params.locid),
    {
      enabled: params.locid !== undefined,
    }
  );

  useEffect(() => {
    if (data) {
      let statId = params.statid;
      if (statId) {
        setSelectedItem(statId);
      } else {
        statId = "";
        if (data.length === 1) {
          statId = data[0].ts_id;
          navigate(`/location/${params.locid}/${statId}`, { replace: true });
        }
        setSelectedItem(statId);
      }
    }
  }, [data]);

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
            onClick={(e) => navigate("/")}
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <MinimalSelect
            locid={params.locid}
            stationList={data}
            selectedStation={selectedItem}
            setSelectedItem={setSelectedItem}
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

        <Station stationId={params.statid ? params.statid : -1} />
      </main>
    </div>
  );
}
