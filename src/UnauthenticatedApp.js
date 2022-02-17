import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";
import { ReactComponent as LogoSvg } from "./calypso.svg";

export default function UnAuntenticatedApp({ setUser }) {
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
          {/* <div className="container">
            <img src={mainLogo} />
          </div> */}
          <LogoSvg />

          <h2>Sensor</h2>

          {location.pathname !== "/pages/register" ? (
            <Button
              disabled={registerDisabled}
              color="secondary"
              variant="contained"
              onClick={() => {
                history.push("/pages/register");
                //setAddStationDisabled(true);
              }}
            >
              Opret konto
            </Button>
          ) : (
            <Button
              color="secondary"
              variant="contained"
              onClick={
                (e) => history.push("/") //context.setLocationId(-1)
              }
            >
              Log ind
            </Button>
          )}
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path={["/", "/:labelid"]}>
          <Login setUser={setUser} />
        </Route>
        <Route path="/pages/register">
          <Register setRegisterDisabled={setRegisterDisabled} />
        </Route>
      </Switch>
    </div>
  );
}
