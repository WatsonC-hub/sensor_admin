import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { Routes, Route, useNavigate, useLocation } from "react-router-dom";
import "./App.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@mui/material";
import { ReactComponent as LogoSvg } from "./calypso.svg";

export default function UnAuntenticatedApp({}) {
  const [registerDisabled, setRegisterDisabled] = useState(false);
  const navigate = useNavigate();
  let location = useLocation();

  return (
    <div className="App">
      <AppBar position="sticky">
        <Toolbar
          style={{
            flexGrow: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <LogoSvg />

          <h2>Sensor</h2>

          {location.pathname !== "/pages/register" ? (
            <Button
              disabled={registerDisabled}
              color="secondary"
              variant="contained"
              onClick={() => {
                navigate("/pages/register");
              }}
            >
              Opret konto
            </Button>
          ) : (
            <Button
              color="secondary"
              variant="contained"
              onClick={(e) => navigate("/")}
            >
              Log ind
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Routes>
        <Route
          path="/pages/register"
          element={<Register setRegisterDisabled={setRegisterDisabled} />}
        />
        <Route path="/" element={<Login />} />
        <Route path="/:labelid" element={<Login />} />
      </Routes>
    </div>
  );
}
