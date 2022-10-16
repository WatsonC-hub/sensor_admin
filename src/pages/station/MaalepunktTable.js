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
import DeleteAlert from "./DeleteAlert";
import LocationContext from "../../context/LocationContext";
import { Fragment } from "react";
import List from "@material-ui/core/List";
import ListItem from "@material-ui/core/ListItem";
import ListItemText from "@material-ui/core/ListItemText";
import IconButton from "@material-ui/core/IconButton";
import DeleteIcon from "@material-ui/icons/Delete";
import EditIcon from "@material-ui/icons/Edit";
import ListItemSecondaryAction from "@material-ui/core/ListItemSecondaryAction";
import moment from "moment";
import Grid from '@material-ui/core/Grid';

const useStyles = makeStyles({
  table: {
    minWidth: 650,
  },
});

function DesktopMP({ watlevmp, handleEdit, handleDelete, canEdit }) {
  const classes = useStyles();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const context = useContext(LocationContext);

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
      <Grid container style={{marginLeft: "2%"}}>
        <Grid item xs={8}>
          <img width="35" height="35" align="left" src={process.env.PUBLIC_URL + "/RulerIcon.svg"} />
          <Typography
            gutterBottom
            variant="h5"
            component="h2"
          >
            Målepunkter
          </Typography>
        </Grid>
      </Grid>
      <TableContainer>
        <Table className={classes.table} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell>Start dato</TableCell>
              <TableCell>Slut dato</TableCell>
              <TableCell align="right">Pejlepunkt [m]</TableCell>
              <TableCell align="right">Beskrivelse</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {watlevmp
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {moment(row.startdate).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell>
                    {moment(row.enddate).format("YYYY-MM-DD HH:mm")}
                  </TableCell>
                  <TableCell align="right">{row.elevation}</TableCell>
                  <TableCell align="right">{row.mp_description}</TableCell>
                  <TableCell align="right">
                    <IconButton
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
        count={watlevmp.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
      />
    </Fragment>
  );
}

function MobileMP({ watlevmp, handleEdit, handleDelete, canEdit }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);const [page, setPage] = React.useState(0);
  const rowsPerPage = 3;

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

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
      <Grid container>
        <Grid item xs={5} style={{ marginTop: "2.5%" }}>
          <Typography gutterBottom variant="h6" component="h2">
            Målepunkter
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <TablePagination
            rowsPerPageOptions={[3]}
            component="div"
            count={watlevmp.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Grid>
      </Grid>
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
                    console.log(row);
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

export default function MaalepunktTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("xs"));

  return matches ? <MobileMP {...props} /> : <DesktopMP {...props} />;
}
