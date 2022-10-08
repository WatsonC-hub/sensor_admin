import React, { useState } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import Typography from "@material-ui/core/Typography";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import DeleteAlert from "./DeleteAlert";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import { Fragment } from "react";
import moment from "moment";
import { StamdataContext } from "../Stamdata/StamdataContext";
import Grid from '@material-ui/core/Grid';
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
  const [, , stamdata, , , , , , , , ,] = React.useContext(StamdataContext);
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
        <Grid item xs={5} style={{marginTop: "2.5%"}}>
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
                      (stamdata.station.tstype_id === 1
                        ? "m"
                        : stamdata.station.unit)
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
                >
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => onDeleteBtnClick(row.gid)}
                  disabled={!canEdit}
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
