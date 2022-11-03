import React, { useContext, useEffect, useState } from "react";
import clsx from "clsx";
import { useTheme } from "@mui/material";
import CssBaseline from "@mui/material/CssBaseline";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import IconButton from "@mui/material/IconButton";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import { getBorehole } from "../boreholeAPI";
import MinimalSelect from "../field/Station/MinimalSelect";
import { useParams, useNavigate } from "react-router-dom";
import Boreholeno from "./Boreholeno";

export default function BoreholeDraw() {
  const open = false;
  const [formToShow, setFormToShow] = useState(null);
  const [currIntake, setCurrIntake] = useState(null);
  const [boreholenoList, setBoreholenoList] = useState([]);
  const [selectedItem, setSelectedItem] = useState(-1);
  const [boreholeno, setSelectedBoreholeno] = useState(-1);

  const theme = useTheme();
  const params = useParams();
  const navigate = useNavigate();

  const currentStation = (id, stations) => {
    if (stations.length === 0) return null;
    return stations.find((s) => s.ts_id + "" === id + "");
  };

  useEffect(() => {
    let boreholeno = params.boreholeno;
    let intakeno = params.intakeno;
    if (intakeno) {
      setSelectedItem(parseInt(intakeno));
    }
    getBorehole(boreholeno).then((res) => {
      if (!intakeno) {
        intakeno = -1;
        if (res.data.features.length === 1) {
          setCurrIntake(res.data.features[0].properties.intakeno);
          intakeno = res.data.features[0].properties.intakeno;
          navigate(`/field/borehole/${boreholeno}/${intakeno}`, {
            replace: true,
          });
        }
        setSelectedItem(parseInt(intakeno));
      } else {
        setCurrIntake(
          currentStation(
            intakeno,
            res.data.features.map((elem) => elem.properties)
          )
        );
      }
      setBoreholenoList(res.data.features.map((elem) => elem.properties));
    });
    setSelectedBoreholeno(boreholeno);
    // setOpen(true);
  }, [params.boreholeno]);

  return (
    <div>
      <CssBaseline />
      <AppBar
        position="sticky"
        style={{ backgroundColor: theme.palette.primary }}
      >
        <Toolbar>
          <IconButton
            color="inherit"
            onClick={(e) => {
              if (location.hash == "") {
                navigate(-1);
              } else {
                navigate(`/field/borehole/${boreholeno}/${intakeno}`, {
                  replace: true,
                });
              }
            }}
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
          <MinimalSelect
            boreholeno={boreholeno}
            boreholenoList={boreholenoList}
            selectedIntake={selectedItem}
            setSelectedItem={setSelectedItem}
            setCurrIntake={setCurrIntake}
            currentIntake={currIntake}
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
        <Boreholeno
          open={open}
          boreholeno={params.boreholeno}
          intakeno={params.intakeno}
          formToShow={formToShow}
          setFormToShow={setFormToShow}
        />
      </main>
    </div>
  );
}
