import React, { useState, useEffect, useContext } from "react";
import Paper from "@material-ui/core/Paper";
import Grid from "@material-ui/core/Grid";
import SearchIcon from "@material-ui/icons/Search";
import TextField from "@material-ui/core/TextField";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import { getTableData } from "../../api";
import LocationContext from "../../LocationContext";
import { CircularProgress } from "@material-ui/core";

export default function StationList(props) {
  const [data, setData] = useState([]);
  const context = useContext(LocationContext);

  const handleClick = (properties) => {
    context.setLocationId(properties.locid + "_" + properties.stationid);
    context.setTabValue(0);
  };

  useEffect(() => {
    getTableData().then((res) => {
      setData(res.data.features);
    });
  }, []);

  if (!data) return <CircularProgress />;

  return (
    // <Paper>
    <List>
      {/* <ListItem>
        <Grid container spacing={1} alignItems='flex-end'>
          <Grid item>
            <SearchIcon />
          </Grid>
          <Grid item>
            <TextField id='input-with-icon-grid' label='With a grid' />
          </Grid>
        </Grid>
      </ListItem> */}
      {data &&
        data.map((r, index) => {
          return (
            <ListItem
              key={index}
              button
              onClick={(e) => handleClick(r.properties)}
              dense
            >
              <ListItemText
                primary={r.properties.stationname}
                // secondary={r.properties.parameter}
                secondary={<StatusText row={r} />}
              />
            </ListItem>
          );
        })}
    </List>
    // </Paper>
  );
}

function StatusText(props) {
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <Typography>{props.row.properties.parameter}</Typography>
      <Typography>{getStatusComp(props.row.properties.alarm)}</Typography>
    </span>
  );
}

function getStatusComp(status) {
  switch (status) {
    case "!":
      return <PriorityHighIcon color='secondary' />;
    case "OK":
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    default:
      return "";
  }
}
