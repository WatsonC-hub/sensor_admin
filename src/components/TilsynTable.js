import React from "react";
import useMediaQuery from "@material-ui/core/useMediaQuery";
import { useTheme } from "@material-ui/core/styles";
import { useState, useContext } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Table from "@material-ui/core/Table";
import TableBody from "@material-ui/core/TableBody";
import TableCell from "@material-ui/core/TableCell";
import TableContainer from "@material-ui/core/TableContainer";
import TableHead from "@material-ui/core/TableHead";
import TableRow from "@material-ui/core/TableRow";
import TablePagination from "@material-ui/core/TablePagination";
import { Typography } from "@material-ui/core";
import Button from "@material-ui/core/Button";
import DeleteAlert from "../pages/station/DeleteAlert";
import LocationContext from "../context/LocationContext";
import { Fragment } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import CheckBoxIcon from "@material-ui/icons/CheckBox";
import CheckBoxOutlineBlankIcon from "@material-ui/icons/CheckBoxOutlineBlank";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import moment from "moment";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function DesktopTilsyn({ services, handleEdit, handleDelete, canEdit }) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceId, setServiceId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const context = useContext(LocationContext);

  // function createData(date, batteryChange, service, comment) {
  //   return { date, batteryChange, service, comment };
  // }

  // const rows = [
  //   createData("2022-01-31 11:04", true, false, "Pælen var væltet"),
  //   createData(
  //     "2021-02-24 9:43",
  //     false,
  //     true,
  //     "Ko havde gennemtygget udstyr Ko havde gennemtygget udstyr Ko havde gennemtygget udstyr"
  //   ),
  // ];

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const onDeleteBtnClick = (id) => {
    setServiceId(id);
    setDialogOpen(true);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  return (
    <Fragment>
      <DeleteAlert
        measurementId={serviceId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Typography gutterBottom variant="h5" component="h2">
        Tilsyn
      </Typography>
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Dato</TableCell>
              <TableCell>Batteriskift</TableCell>
              <TableCell>Tilsyn</TableCell>
              <TableCell align="center">Kommentar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {moment(row.dato).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell align="center">
                    {row.batteriskift === true ? (
                      <CheckBoxIcon color="action"></CheckBoxIcon>
                    ) : (
                      <CheckBoxOutlineBlankIcon color="action"></CheckBoxOutlineBlankIcon>
                    )}
                  </TableCell>
                  <TableCell align="center">
                    {row.tilsyn === true ? (
                      <CheckBoxIcon color="action"></CheckBoxIcon>
                    ) : (
                      <CheckBoxOutlineBlankIcon color="action"></CheckBoxOutlineBlankIcon>
                    )}
                  </TableCell>
                  <TableCell align="center">{row.kommentar}</TableCell>
                  <TableCell>
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
        count={services.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />
    </Fragment>
  );
}

function MobileTilsyn({ watlevmp, handleEdit, handleDelete, canEdit }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const onDeleteBtnClick = (id) => {
    setMpId(id);
    setDialogOpen(true);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  return (
    <Fragment>
      <DeleteAlert
        measurementId={mpId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Typography gutterBottom variant="h5" component="h2">
        Tidligere pejlinger
      </Typography>
      <Fragment>
        <List>
          {watlevmp.map((row, index) => (
            <ListItem key={index} dense>
              <ListItemText
                primary={
                  row.startdate.split(" ")[0] +
                  " - " +
                  row.enddate.split(" ")[0]
                }
                secondary={"Målepunkt: " + row.elevation + " m"}
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

export default function TilsynTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  return matches ? <MobileTilsyn {...props} /> : <DesktopTilsyn {...props} />;
}
