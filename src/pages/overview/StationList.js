import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";

import { getTableData } from "../../api";
import LocationContext from "../../context/LocationContext";
import { CircularProgress } from "@material-ui/core";

export default function StationList(props) {
  const [data, setData] = useState([]);
  const context = useContext(LocationContext);
  const history = useHistory();

  const handleClick = (elem) => {
    console.log("elem loc: ", elem);
    context.setLocationId(elem.locid + "_" + elem.stationid);
    context.setTabValue(0);
    history.push(`location/${elem.locid}/${elem.stationid}`);
  };

  useEffect(() => {
    getTableData(sessionStorage.getItem("session_id")).then((res) => {
      setData(res.data.result);
    });
  }, []);

  if (!data) return <CircularProgress />;

  return (
    <List>
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
                secondary={<StatusText row={elem} />}
              />
            </ListItem>
          );
        })}
    </List>
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
      <Typography>{props.row.stationname}</Typography>
      <Typography>{getStatusComp(props.row.alarm)}</Typography>
    </span>
  );
}

function getStatusComp(status) {
  switch (status) {
    case "!":
      return <PriorityHighIcon color="secondary" />;
    case "OK":
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    default:
      return "";
  }
}
