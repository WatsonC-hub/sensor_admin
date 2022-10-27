import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteAlert from "./DeleteAlert";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import { Fragment } from "react";
import moment from "moment";
import { stamdataStore } from "../../state/store";
import Grid from "@material-ui/core/Grid";
import TablePagination from "@material-ui/core/TablePagination";

export default function MobileMeasurements({
  measurements,
  handleEdit,
  handleDelete,
  canEdit,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);

  const [page, setPage] = React.useState(0);
  const rowsPerPage = 3;
  const [timeseries] = stamdataStore((state) => [state.timeseries]);
  const onDeleteBtnClick = (id) => {
    setMeasurementId(id);
    setDialogOpen(true);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  return (
    <Fragment>
      <DeleteAlert
        measurementId={measurementId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Grid container>
        <Grid item xs={5} style={{ marginTop: "2.5%" }}>
          <Typography gutterBottom variant="h6" component="h2">
            Kontrolmålinger
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <TablePagination
            rowsPerPageOptions={[3]}
            component="div"
            count={measurements.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Grid>
      </Grid>
      <Fragment>
        <List>
          {measurements.map((row, index) => (
            <ListItem key={index} dense>
              <ListItemText
                primary={moment(row.timeofmeas).format("YYYY-MM-DD HH:mm")}
                secondary={
                  row.measurement === null
                    ? "Måling ikke mulig"
                    : "Måling: " +
                      row.measurement +
                      " " +
                      (timeseries.tstype_id === 1 ? "m" : timeseries.unit)
                }
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    handleEdit(row);
                    setTimeout(() => {
                      window.scrollTo({ top: 300, behavior: "smooth" });
                    }, 200);
                  }}
                  disabled={!canEdit}
                  size="large"
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => onDeleteBtnClick(row.gid)}
                  disabled={!canEdit}
                  size="large"
                >
                  <DeleteIcon />
                </IconButton>
              </ListItemSecondaryAction>
            </ListItem>
          ))}
        </List>
      </Fragment>
    </Fragment>
  );
}
