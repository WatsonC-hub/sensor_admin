import React, { useState } from "react";
import Login from "./pages/Login/Login";
import Register from "./pages/Register/Register";
import { BrowserRouter as Router, Switch, Route } from "react-router-dom";
import "./App.css";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { Button } from "@material-ui/core";

export default function UnAuntenticatedApp({ setUser }) {
  return (
    <Router>
      <AppBar position="sticky">
        <Toolbar
          style={{
            flexGrow: 1,
            flexDirection: "row",
            justifyContent: "space-between",
          }}
        >
          <Button
            color="secondary"
            variant="contained"
            onClick={(event) => (window.location.href = "/")}
          >
            Log ind
          </Button>
        </Toolbar>
      </AppBar>
      <Switch>
        <Route exact path="/">
          <Login setUser={setUser} />
        </Route>
        <Route path="/register">
          <Register />
        </Route>
      </Switch>
    </Router>
  );
}
