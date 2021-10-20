import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
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
  const history = useHistory();

  const handleClick = (elem) => {
    context.setLocationId(elem.locid + "_" + elem.ts_id);
    context.setTabValue(0);
    history.push(`/location/${elem.locid}/${elem.ts_id}`);
  };

  useEffect(() => {
    getTableData(sessionStorage.getItem("session_id")).then((res) => {
      setData(res.data.result);
    });
  }, []);

  if (!data) return <CircularProgress />;

  return (
    // <Paper> style={{ height: "700px", overflow: "scroll" }}
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
        data.map((elem, index) => {
          return (
            <ListItem
              key={index}
              button
              onClick={(e) => handleClick(elem)}
              dense
            >
              <ListItemText
                primary={elem.ts_name}
                // secondary={r.properties.parameter}
                secondary={<StatusText row={elem} />}
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
      <Typography>{props.row.parameter}</Typography>
      <Typography>{getStatusComp(props.row.alarm)}</Typography>
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
