import React, { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import { IconButton, Typography } from "@material-ui/core";
import DeleteAlert from "./DeleteAlert";
import LocationContext from "../../state/LocationContext";
import { Fragment } from "react";
import EditIcon from "@material-ui/icons/Edit";
import DeleteIcon from "@material-ui/icons/Delete";
import moment from "moment";
import { StamdataContext } from "../../state/StamdataContext";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

export default function HistoricMeasurements({
  measurements,
  handleEdit,
  handleDelete,
  canEdit,
}) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const [, , stamdata, , , , , , , , ,] = React.useContext(StamdataContext);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onDeleteBtnClick = (id) => {
    setMeasurementId(id);
    setDialogOpen(true);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  const correction_map = {
    0: "Kontrol",
    1: "Korrektion fremadrettet",
    2: "Korrektion frem og tilbage",
  };

  return (
    <Fragment>
      <DeleteAlert
        measurementId={measurementId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Typography gutterBottom variant="h5" component="h2">
        Kontrolmålinger
      </Typography>
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Dato</TableCell>
              <TableCell align="right">
                {stamdata.station.tstype_id === 1
                  ? "Pejling (nedstik) [m]"
                  : `Måling [${stamdata.station.unit}]`}
              </TableCell>
              <TableCell align="right">Anvendelse</TableCell>
              <TableCell align="right">Kommentar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {measurements
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {moment(row.timeofmeas).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell align="right">{row.measurement}</TableCell>
                  <TableCell align="right">
                    {correction_map[row.useforcorrection]
                      ? correction_map[row.useforcorrection]
                      : "Kontrol"}
                  </TableCell>
                  <TableCell align="right">{row.comment}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => handleEdit(row)}
                      disabled={!canEdit}
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        onDeleteBtnClick(row.gid);
                      }}
                      disabled={!canEdit}
                    >
                      <DeleteIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[5]}
        component="div"
        count={measurements.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />
    </Fragment>
  );
}
