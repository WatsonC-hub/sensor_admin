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
      <Typography gutterBottom variant="h5" component="h2">
        Tilsyn
      </Typography>
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
      <Typography gutterBottom variant="h5" component="h2">
        Tilsyn
      </Typography>
      <Fragment>
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
        <TablePagination
          rowsPerPageOptions={[5]}
          component="div"
          count={services.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
        />
      </Fragment>
    </Fragment>
  );
}

export default function TilsynTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("sm"));

  return matches ? <MobileTilsyn {...props} /> : <DesktopTilsyn {...props} />;
}
