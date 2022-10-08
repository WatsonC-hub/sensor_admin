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
import Grid from '@material-ui/core/Grid';
import moment from "moment";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
  tableMobile: {
    minWidth: 300,
  },
});

function DesktopTilsyn({ services, handleEdit, handleDelete, canEdit }) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceId, setServiceId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const context = useContext(LocationContext);

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
      <Grid container style={{marginLeft: "2%"}}>
        <Grid item xs={8}>
          <img width="35" height="35" align="left" src={process.env.PUBLIC_URL + "/TilsynIcon.svg"} />
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
          >
            Tilsyn
          </Typography>
        </Grid>
        <Grid item xs={3} style={{marginLeft: "5%"}}>
          <TablePagination
          rowsPerPageOptions={[5]}
          component="div"
          count={services.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          />
        </Grid>
      </Grid>
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
    </Fragment>
  );
}

function MobileTilsyn({ services, handleEdit, handleDelete, canEdit }) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceId, setServiceId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const context = useContext(LocationContext);

  const onDeleteBtnClick = (id) => {
    setServiceId(id);
    setDialogOpen(true);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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
      <Grid container>
        <Grid item xs={5} style={{marginTop: "2.5%"}}>
          <img width="30" height="30" align="left" src={process.env.PUBLIC_URL + "/TilsynIcon.svg"} />
          <Typography gutterBottom variant="h6" component="h2">
            Tilsyn
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={services.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Grid>
      </Grid>

      <Fragment>
        <List>
          {services.map((row, index) => (
            <ListItem key={index} dense>
              {row.batteriskift ? <img width="30" height="30" align="left" style={{marginRight: "5px"}} src={process.env.PUBLIC_URL + "/LowBatteryIcon.png"} />
                : row.tilsyn ? <img width="30" height="30" align="left" style={{marginRight: "5px"}} src={process.env.PUBLIC_URL + "/EyeIcon.png"} /> : ""}
              <ListItemText
                primary={row.batteriskift && row.tilsyn ? <b>Batteri skiftet og tilsyn</b>
                          : row.batteriskift && row.tilsyn !== true ? <b>Batteri skiftet</b>
                          : row.batteriskift !== true && row.tilsyn ? <b>Tilsyn</b> : <b>"-"</b>}
                secondary={moment(row.dato).format("YYYY-MM-DD HH:mm")}
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

      {/* <Fragment>
        <TableContainer>
          <Table className={classes.mobile} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell>Dato</TableCell>
                <TableCell>Batteri</TableCell>
                <TableCell>Tilsyn</TableCell>
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
      </Fragment> */}
    </Fragment>
  );
}

export default function TilsynTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  return matches ? <MobileTilsyn {...props} /> : <DesktopTilsyn {...props} />;
}
