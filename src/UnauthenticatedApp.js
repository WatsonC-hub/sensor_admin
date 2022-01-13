import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { Switch, Route, useHistory, useLocation } from "react-router-dom";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";

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
          {location.pathname !== "/register" ? (
            <Button
              disabled={registerDisabled}
              color="secondary"
              variant="contained"
              onClick={() => {
                history.push("/register");
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
        <Route exact path="/">
          <Login setUser={setUser} />
        </Route>
        <Route path="/register">
          <Register setRegisterDisabled={setRegisterDisabled} />
        </Route>
      </Switch>
    </div>
  );
}
