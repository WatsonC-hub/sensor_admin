import React from "react";
import { Card, CardContent, CardHeader, Grid, Typography } from "@mui/material";
import BuildCircleIcon from "@mui/icons-material/BuildCircle";
import SettingsIcon from "@mui/icons-material/Settings";
import NotificationsActiveIcon from "@mui/icons-material/NotificationsActive";
import SupervisorAccountIcon from "@mui/icons-material/SupervisorAccount";
import RouterIcon from "@mui/icons-material/Router";
import ChoiseCard from "../../components/ChoiseCard";
const AdminChooser = () => {
  return (
    <Grid
      container
      spacing={8}
      sx={{
        justifyContent: "center",
        alignItems: "center",
        marginTop: 10,
      }}
    >
      <Grid item xs={10} sm={5}>
        <ChoiseCard
          navigateTo="konfiguration"
          title="Omkonfigurer enheder"
          text="Omkonfigurer enheder"
          icon={RouterIcon}
        />
      </Grid>
      <Grid item xs={10} sm={5}>
        <ChoiseCard
          navigateTo="notifikationer"
          title="Notifikationer"
          text="Se notifikationer"
          icon={NotificationsActiveIcon}
        />
      </Grid>
      <Grid item xs={10} sm={5}>
        <ChoiseCard
          navigateTo="brugerstyring"
          title="Brugerstyring"
          text="Administrer brugere"
          icon={SupervisorAccountIcon}
        />
      </Grid>
    </Grid>
  );
};

export default AdminChooser;
