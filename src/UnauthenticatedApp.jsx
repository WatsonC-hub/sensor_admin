import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import AppBar from "@mui/material/AppBar";
import Toolbar from "@mui/material/Toolbar";
import { Button } from "@mui/material";
import { ReactComponent as LogoSvg } from "./calypso.svg";

export default function UnAuntenticatedApp({}) {
  const [registerDisabled, setRegisterDisabled] = useState(false);
  const history = useHistory();
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
                history.push("/pages/register");
              }}
            >
              Opret konto
            </Button>
          ) : (
            <Button
              color="secondary"
              variant="contained"
              onClick={(e) => history.push("/")}
            >
              Log ind
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path="/pages/register">
          <Register setRegisterDisabled={setRegisterDisabled} />
        </Route>
        <Route path={["/", "/:labelid"]}>
          <Login />
        </Route>
      </Switch>
    </div>
  );
}
