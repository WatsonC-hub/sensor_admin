import React, { useState, useEffect, useContext } from "react";
import { useNavigate } from "react-router-dom";
import Paper from "@mui/material/Paper";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import PriorityHighIcon from "@mui/icons-material/PriorityHigh";
import CheckCircleIcon from "@mui/icons-material/CheckCircle";
import CircularProgress from "@mui/material/CircularProgress";
import {
  Grid,
  VirtualTable,
  TableHeaderRow,
  TableRowDetail,
} from "@devexpress/dx-react-grid-material-ui";
import { TextField, Tooltip } from "@mui/material";
import useWindowDimensions from "src/hooks/useWindowDimensions";

const Cell = (props) => {
  const navigate = useNavigate();

  return (
    <VirtualTable.Cell
      {...props}
      style={{ cursor: "pointer" }}
      onClick={(e) => {
        if (props.row.navigateTo) {
          navigate(props.row.navigateTo);
        }
      }}
    />
  );
};

const TitleCell = (props) => {
  return <TableHeaderRow.Title {...props} />;
};

export default function StationListDesktop({ data, columns, loading }) {
  const [typeAhead, settypeAhead] = useState("");
  const { height, width } = useWindowDimensions();

  var rows = [];
  // filter data based on typeAhead and columns
  if (data) {
    rows = data.filter((row) => {
      return columns.some((column) => {
        return (
          row[column.name]
            .toString()
            .toLowerCase()
            .indexOf(typeAhead.toLowerCase()) > -1
        );
      });
    });
  }

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
      />
      <Paper>
        <Grid rows={rows} columns={columns}>
          {/* <LocationTypeProvider for={["station_loc_id"]} /> */}
          {/* <RowDetailState defaultExpandedRowIds={[]} /> */}
          <VirtualTable
            height={height - 330}
            cellComponent={Cell}
            messages={{ noData: "Ingen data" }}
            // columnExtensions={column_extension}
          />
          {loading && <CircularProgress />}
          <TableHeaderRow titleComponent={TitleCell} />
          {/* <TableRowDetail contentComponent={RowDetail} /> */}
        </Grid>
      </Paper>
    </div>
  );
}
