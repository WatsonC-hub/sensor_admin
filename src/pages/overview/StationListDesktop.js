import React, { useState, useEffect, useContext } from "react";
import { useHistory } from "react-router-dom";
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
import { getTableData } from "../../api";
import { Tooltip } from "@material-ui/core";
import LocationContext from "../../context/LocationContext";

const LocationTypeProvider = (props) => (
  <DataTypeProvider formatterComponent={LocationFormatter} {...props} />
);

const LocationFormatter = ({ value }) => <EditButton locationId={value} />;

const EditButton = ({ locationId }) => {
  const context = useContext(LocationContext);
  const history = useHistory();
  return (
    <IconButton
      aria-label="Edit"
      onClick={(e) => {
        context.setLocationId(locationId);
        context.setTabValue(0);
        let [loc, stat] = locationId.split("_");
        history.push(`location/${loc}/${stat}`);
      }}
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

const getStatusComp = (status) => {
  switch (status) {
    case "#00FF00":
      return <CheckCircleIcon style={{ color: "mediumseagreen" }} />;
    default:
      return <PriorityHighIcon style={{ color: status }} />;
  }
};

const StatusCell = ({ color, style, ...restProps }) => {
  return (
    <VirtualTable.Cell {...restProps}>
      <Tooltip title={restProps.row.opgave}>
        {getStatusComp(restProps.row.color)}
      </Tooltip>
    </VirtualTable.Cell>
  );
};

const Cell = (props) => {
  const context = useContext(LocationContext);
  const history = useHistory();
  const { column } = props;
  if (column.name === "color") {
    return <StatusCell {...props} />;
  }
  return (
    <VirtualTable.Cell
      {...props}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        context.setLocationId(props.row.station_loc_id);
        context.setTabValue(0);
        let [loc, stat] = props.row.station_loc_id.split("_");
        history.push(`location/${loc}/${stat}`);
      }}
    />
  );
};

const TitleCell = (props) => {
  const { children } = props;
  if (children === "Redigere") {
    return "";
  }
  return <TableHeaderRow.Title {...props} />;
};

const columns = [
  { name: "calypso_id", title: "Calypso ID", width: 50 },
  { name: "ts_name", title: "Stationsnavn", width: 200 },
  { name: "tstype_name", title: "Parameter", width: 200 },
  { name: "customer_name", title: "Ejer", width: 200 },
  {
    name: "color",
    title: "Alarm",
    width: 200,
  },
];

export default function StationListDesktop() {
  const [data, setData] = useState([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    setLoading(true);
    getTableData(sessionStorage.getItem("session_id")).then((res) => {
      setLoading(false);
      setData(res.data.result);
    });
  }, []);

  let rows = data.map((elem, index) => ({
    ...elem,
    station_loc_id: elem.loc_id + "_" + elem.ts_id,
    id: index,
  }));

  return (
    <Paper>
      {loading && <CircularProgress />}
      <Grid rows={rows} columns={columns} style={{ height: 1200 }}>
        {/* <LocationTypeProvider for={["station_loc_id"]} /> */}
        {/* <RowDetailState defaultExpandedRowIds={[]} /> */}
        <VirtualTable height={1200} cellComponent={Cell} />
        <TableHeaderRow titleComponent={TitleCell} />
        {/* <TableRowDetail contentComponent={RowDetail} /> */}
      </Grid>
    </Paper>
  );
}
