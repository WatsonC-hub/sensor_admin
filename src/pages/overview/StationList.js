import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { TextField } from "@material-ui/core";

import LocationContext from "../../context/LocationContext";
import { CircularProgress } from "@material-ui/core";

export default function StationList({ data }) {
  const context = useContext(LocationContext);
  const history = useHistory();
  const [typeAhead, settypeAhead] = useState("");

  const handleClick = (elem) => {
    console.log("elem loc: ", elem);
    context.setLocationId(elem.loc_id + "_" + elem.ts_id);
    context.setTabValue(0);
    history.push(`location/${elem.loc_id}/${elem.ts_id}`);
  };

  if (!data) return <CircularProgress />;

  let rows = data.filter((elem) => {
    return (
      elem.ts_name.toLowerCase().includes(typeAhead.toLowerCase()) ||
      elem.calypso_id.toString().toLowerCase().includes(typeAhead.toLowerCase())
    );
  });

  return (
    <div>
      <TextField
        variant="outlined"
        label={"Filtrer stationer"}
        InputLabelProps={{ shrink: true }}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{ marginBottom: 12 }}
        size="small"
        align="center"
      />
      <List>
        {data &&
          rows.map((elem, index) => {
            return (
              <ListItem
                key={index}
                button
                onClick={(e) => handleClick(elem)}
                dense
              >
                <ListItemText
                  primary={elem.ts_name}
                  secondary={
                    elem.active ? "Calypso ID: " + elem.calypso_id : " "
                  }
                />
                <StatusText row={elem} />
              </ListItem>
            );
          })}
      </List>
    </div>
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
      <ListItemText
        primary={getStatusComp(props.row.color, props.row.active)}
        // secondary={props.row.opgave}
      />
      {/* <Typography>{getStatusComp(props.row.color)}</Typography> */}
    </span>
  );
}

const getStatusComp = (status, active) => {
  if (!active) {
    return <CheckCircleIcon style={{ color: "grey" }} />;
  }
  switch (status) {
    case "#00FF00":
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    case null:
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    default:
      return <PriorityHighIcon style={{ color: status }} />;
  }
};
