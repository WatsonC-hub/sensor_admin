import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import { TextField } from "@material-ui/core";
import Divider from '@material-ui/core/Divider';
import StraightenIcon from '@material-ui/icons/Straighten';
import LocationContext from "../../context/LocationContext";
import { CircularProgress } from "@material-ui/core";
import SpeedIcon from '@material-ui/icons/Speed';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@material-ui/icons/SignalCellularConnectedNoInternet0BarRounded';
import BatteryAlertIcon from '@material-ui/icons/BatteryAlert';
import BuildRoundedIcon from '@material-ui/icons/BuildRounded';
import HeightIcon from '@material-ui/icons/Height';

export default function StationList({ data }) {
  const context = useContext(LocationContext);
  const history = useHistory();
  const [typeAhead, settypeAhead] = useState("");

  const handleClick = (elem) => {
    console.log("elem loc: ", elem);
    context.setLocationId(elem.loc_id);
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
              <div>
                <ListItem
                  key={index}
                  button
                  onClick={(e) => handleClick(elem)}
                  dense
                >
                  <TypeIcon row={elem}/>
                  <ListItemText
                    primary={elem.ts_name}
                    secondary={
                      elem.active ? "Calypso ID: " + elem.calypso_id : " "
                    }
                  />
                  <StatusText row={elem} />
                </ListItem>
                <Divider component="li" />
              </div>
            );
          })}
      </List>
    </div>
  );
}

function TypeIcon(props) {
  console.log(props.row)
  return (
    <span
      style={{
        display: "flex",
        flexDirection: "row",
        justifyContent: "space-between",
      }}
    >
      <ListItemText
        primary={getType(props.row.tstype_name)}
        // secondary={props.row.opgave}
      />
    </span>
  );
}

const getType = (type) => {
  switch (type) {
    case "Vandstand":
      return <StraightenIcon style = {{color: "grey", transform: 'rotate(90deg)' }}/>
    case "Temperatur":
      return <span style={{color: "grey"}} class="material-icons">thermostat</span>
    case "Nedbør":
      return <img width="25" height="25" style={{marginRight: "5px"}} src={process.env.PUBLIC_URL + "/rainIcon.png"} />
    case "Hastighed":
      return <SpeedIcon style={{color: "grey"}}/>
    case "Opløst ilt":
    case "Vandets iltindhold":
    case "Ilt mætning":
      return <img width="20" height="20" style={{marginRight: "5px"}} src={process.env.PUBLIC_URL + "/oxygenIcon.png"} />
    case "Vandføring":
      return <img width="25" height="25" style={{marginRight: "5px"}} src={process.env.PUBLIC_URL + "/waterFlowIcon.png"} />
    case "Fugtighed":
      return <img width="25" height="25" style={{marginRight: "5px"}} src={process.env.PUBLIC_URL + "/soilMoistureIcon.png"} />
      default:
      return "";
  }
};
// Vandføring #6D6D6D
// Nedbør
// Hastighed
// Tryk
// Temperatur
// Fugtighed
// Opløst ilt
// Nitrat
// Salinitet
// Konduktivitet
// Vandets iltindhold

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
        primary={getStatusComp(props.row.color, props.row.active, props.row.opgave)}
        // secondary={props.row.opgave}
      />
      {/* <Typography>{getStatusComp(props.row.color)}</Typography> */}
    </span>
  );
}

const getStatusComp = (status, active, task) => {
  if (!active) {
    return <CheckCircleIcon style={{ color: "grey" }} />;
  }
  // switch (status) {
  //   case "#00FF00":
  //     return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
  //   case null:
  //     return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
  //   default:
  //     return <PriorityHighIcon style={{ color: status }} />;
  // }

  switch (task) {
    case "Ok":
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    case null:
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    case "Sender ikke":
    case "Sender null":
      return <SignalCellularConnectedNoInternet0BarRoundedIcon style={{ color: status }} />
    case "Batterskift":
      return <BatteryAlertIcon style={{ color: status }} />
    case "Tilsyn":
      return <BuildRoundedIcon style={{ color: status }} />
    case "Pejling":
      return <HeightIcon style={{ color: status }} />
    default:
      return <PriorityHighIcon style={{ color: status }} />;
  }
};
