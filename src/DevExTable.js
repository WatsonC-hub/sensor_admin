import React, { useState, useEffect, useContext } from "react";
import Paper from "@material-ui/core/Paper";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import EditIcon from "@material-ui/icons/Edit";
import IconButton from "@material-ui/core/IconButton";
import PriorityHighIcon from "@material-ui/icons/PriorityHigh";
import CheckCircleIcon from "@material-ui/icons/CheckCircle";
import CircularProgress from "@material-ui/core/CircularProgress";
import { DataTypeProvider } from "@devexpress/dx-react-grid";
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableRowDetail,
} from "@devexpress/dx-react-grid-material-ui";
import { RowDetailState } from "@devexpress/dx-react-grid";
import { getTableData } from "./api";
import LocationContext from "./LocationContext";

const LocationTypeProvider = (props) => (
  <DataTypeProvider formatterComponent={LocationFormatter} {...props} />
);

const LocationFormatter = ({ value }) => <EditButton locationId={value} />;

const showDetails = (loc) => alert(loc);

const EditButton = ({ locationId }) => {
  const context = useContext(LocationContext);
  return (
    <IconButton
      aria-label='Edit'
      onClick={(e) => context.setLocationId(locationId)}
    >
      <EditIcon />
    </IconButton>
  );
};

const RowDetail = ({ row }) => (
  <List>
    <ListItem>
      <b>Location ID: </b>
      {row.locid}
    </ListItem>
    <ListItem>
      <b>Station ID: </b>
      {row.stationid}
    </ListItem>
  </List>
);

const getBackgroundColor = (status) => {
  switch (status) {
    case "OK":
      return "rgba(157, 255, 118, 0.49)";
    case "!":
      return "#d47483";
    default:
      return "";
  }
};

const getStatusComp = (status) => {
  switch (status) {
    case "!":
      return <PriorityHighIcon color='secondary' />;
    case "OK":
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    default:
      return "";
  }
};

const StatusCell = ({ value, style, ...restProps }) => (
  <VirtualTable.Cell {...restProps}>{getStatusComp(value)}</VirtualTable.Cell>
);

const Cell = (props) => {
  const { column } = props;
  if (column.name === "alarm") {
    return <StatusCell {...props} />;
  }
  return <VirtualTable.Cell {...props} />;
};

const TitleCell = (props) => {
  const { children } = props;
  if (children === "Redigere") {
    return "";
  }
  return <TableHeaderRow.Title {...props} />;
};

const columns = [
  { name: "station_loc_id", title: "Redigere", width: 50 },
  { name: "stationname", title: "Stationsnavn", width: 200 },
  { name: "parameter", title: "Parameter", width: 200 },
  { name: "loc_owner", title: "Ejer", width: 200 },
  {
    name: "alarm",
    title: "Alarm",
    width: 200,
  },
];

export default ({ setLocation }) => {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTableData().then((res) => {
      setLoading(false);
      setData(res.data.features);
    });
  }, []);

  let rows = data.map((s, index) => ({
    ...s.properties,
    station_loc_id: s.properties.locid + "_" + s.properties.stationid,
    id: index,
  }));

  return (
    <Paper>
      {loading && <CircularProgress />}
      <Grid rows={rows} columns={columns} style={{ height: 1200 }}>
        <LocationTypeProvider for={["station_loc_id"]} />
        <RowDetailState defaultExpandedRowIds={[]} />
        <VirtualTable height={1200} cellComponent={Cell} />
        <TableHeaderRow titleComponent={TitleCell} />
        <TableRowDetail contentComponent={RowDetail} />
      </Grid>
    </Paper>
  );
};
