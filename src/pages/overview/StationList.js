import React, { useState, useEffect, useContext } from "react";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import { getTableData } from "../../api";
import LocationContext from "../../LocationContext";

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

  return (
    // <Paper>
    <List>
      {data &&
        data.map((r, index) => {
          return (
            <ListItem
              key={index}
              button
              onClick={(e) => handleClick(r.properties)}
            >
              <ListItemText
                primary={r.properties.stationname}
                secondary={r.properties.parameter}
              />
            </ListItem>
          );
        })}
    </List>
    // </Paper>
  );
}
