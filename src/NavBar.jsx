import React from "react";
import { useNavigate } from "react-router-dom";
import { AppBar, Toolbar, Button, IconButton, Box, Badge } from "@mui/material";
import { ReactComponent as LogoSvg } from "./calypso.svg";
import { authStore } from "./state/store";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";
import KeyboardBackspaceIcon from "@mui/icons-material/KeyboardBackspace";
import PhotoCameraRounded from "@mui/icons-material/PhotoCameraRounded";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsIcon from "@mui/icons-material/Notifications";
import { useAtom } from "jotai";
import { captureDialogAtom } from "./state/atoms";

const LogOut = () => {
  const [setAuthenticated, setUser, setSessionId] = authStore((state) => [
    state.setAuthenticated,
    state.setUser,
    state.setSessionId,
  ]);
  const navigate = useNavigate();

  const handleLogout = () => {
    // sessionStorage.removeItem("session_id");
    // sessionStorage.removeItem("user");
    setAuthenticated(false);
    setSessionId(null);
    setUser(null);
    navigate("/");
  };

  return (
    <Button color="grey" variant="contained" onClick={handleLogout}>
      Log ud
    </Button>
  );
};

const AppBarLayout = ({ children }) => {
  return (
    <AppBar position="sticky">
      <Toolbar
        style={{
          flexGrow: 1,
          flexDirection: "row",
          justifyContent: "space-between",
        }}
      >
        {children}
      </Toolbar>
    </AppBar>
  );
};

const NavBar = ({ children }) => {
  const [authenticated] = authStore((state) => [state.authenticated]);
  const [open, setOpen] = useAtom(captureDialogAtom);
  const navigate = useNavigate();
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  if (!authenticated) {
    return (
      <AppBarLayout>
        <LogoSvg />
        <h2>Sensor</h2>
        {location.pathname !== "/register" ? (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              navigate("/register");
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
      </AppBarLayout>
    );
  }
  if (location.pathname.includes("/location")) {
    return null;
  }

  if (location.pathname.includes("/field")) {
    return (
      <AppBarLayout>
        {!location.pathname.includes("/stamdata") ? (
          <Button
            color="secondary"
            variant="contained"
            onClick={() => {
              navigate("stamdata");
              //setAddStationDisabled(true);
            }}
          >
            Opret station
          </Button>
        ) : (
          <IconButton
            color="inherit"
            onClick={
              (e) => navigate("") //context.setLocationId(-1)
            }
            size="large"
          >
            <KeyboardBackspaceIcon />
          </IconButton>
        )}

        <h2>Field</h2>

        {matches && (
          <IconButton
            color="inherit"
            onClick={() => setOpen(true)}
            size="large"
          >
            <PhotoCameraRounded />
          </IconButton>
        )}

        <Box>
          <Button
            color="grey"
            variant="contained"
            onClick={() => {
              navigate("/admin");
            }}
            startIcon={<SettingsIcon />}
          >
            Admin
          </Button>
          <LogOut />
        </Box>
      </AppBarLayout>
    );
  }

  if (location.pathname.includes("/admin")) {
    return (
      <AppBarLayout>
        <LogoSvg />

        <h2>Admin</h2>

        <Box
          sx={{
            // display: "flex",
            // flexDirection: "row",
            // justifyContent: "space-between",
            // alignItems: "center",
            p: 1,
          }}
        >
          <Badge badgeContent={17} color="error">
            <NotificationsIcon />
          </Badge>
          <Button
            color="grey"
            variant="contained"
            onClick={() => {
              navigate("/field");
            }}
            startIcon={<BuildCircleIcon />}
          >
            Field
          </Button>
          <LogOut />
        </Box>
      </AppBarLayout>
    );
  }

  return (
    <AppBarLayout>
      <LogoSvg />

      <h2>Vælg indgang</h2>

      <LogOut />
    </AppBarLayout>
  );
};

export default NavBar;
