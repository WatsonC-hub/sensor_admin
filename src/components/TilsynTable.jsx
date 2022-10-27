import React from "react";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";
import { useState, useContext } from "react";
import Table from "@mui/material/Table";
import TableBody from "@mui/material/TableBody";
import TableCell from "@mui/material/TableCell";
import TableContainer from "@mui/material/TableContainer";
import TableHead from "@mui/material/TableHead";
import TableRow from "@mui/material/TableRow";
import TablePagination from "@mui/material/TablePagination";
import { Typography } from "@mui/material";
import Button from "@mui/material/Button";
import DeleteAlert from "../pages/station/DeleteAlert";
import { Fragment } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import CheckBoxIcon from "@mui/icons-material/CheckBox";
import CheckBoxOutlineBlankIcon from "@mui/icons-material/CheckBoxOutlineBlank";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import moment from "moment";

function DesktopTilsyn({ services, handleEdit, handleDelete, canEdit }) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceId, setServiceId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

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
      <Grid container style={{ marginLeft: "2%" }}>
        <Grid item xs={8}>
          <img
            width="35"
            height="35"
            align="left"
            src={process.env.PUBLIC_URL + "/TilsynIcon.svg"}
          />
          <Typography gutterBottom variant="h5" component="h2">
            Tilsyn
          </Typography>
        </Grid>
        <Grid item xs={3} style={{ marginLeft: "5%" }}>
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
        <Table aria-label="simple table" sx={{ minWidth: 650 }}>
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
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        onDeleteBtnClick(row.gid);
                      }}
                      disabled={!canEdit}
                      size="large"
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
  const [dialogOpen, setDialogOpen] = useState(false);
  const [serviceId, setServiceId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

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
        <Grid item xs={5} style={{ marginTop: "2.5%" }}>
          <img width="30" height="30" align="left" src="/TilsynIcon.svg" />
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
              {row.batteriskift ? (
                <img
                  width="30"
                  height="30"
                  align="left"
                  style={{ marginRight: "5px" }}
                  src="/LowBatteryIcon.png"
                />
              ) : row.tilsyn ? (
                <img
                  width="30"
                  height="30"
                  align="left"
                  style={{ marginRight: "5px" }}
                  src="/EyeIcon.png"
                />
              ) : (
                ""
              )}
              <ListItemText
                primary={
                  row.batteriskift && row.tilsyn ? (
                    <b>Batteri skiftet og tilsyn</b>
                  ) : row.batteriskift && row.tilsyn !== true ? (
                    <b>Batteri skiftet</b>
                  ) : row.batteriskift !== true && row.tilsyn ? (
                    <b>Tilsyn</b>
                  ) : (
                    <b>"-"</b>
                  )
                }
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
          <Table aria-label="simple table" sx={{ minWidth: 300 }}>
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
                        size="large"
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
                        size="large"
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
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return matches ? <MobileTilsyn {...props} /> : <DesktopTilsyn {...props} />;
}
