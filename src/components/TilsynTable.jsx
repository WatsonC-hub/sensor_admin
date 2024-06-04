import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import {Typography} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import ListItemText from '@mui/material/ListItemText';
import {useTheme} from '@mui/material/styles';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import React, {Fragment, useState} from 'react';

import DeleteAlert from '~/components/DeleteAlert';
import TilsynTableDesktop from '~/components/tableComponents/TilsynTableDesktop';

import TilsynTableMobile from './tableComponents/TilsynTableMobile';

function DesktopTilsyn({services, handleEdit, handleDelete, canEdit}) {
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
      <Grid container>
        <Grid item xs={8}>
          <img width="35" height="35" align="left" src="/TilsynIcon.svg" />
          <Typography gutterBottom variant="h5" component="h2">
            Tilsyn
          </Typography>
        </Grid>
        <Grid item xs={3} style={{marginLeft: '5%'}}>
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
        <Table aria-label="simple table" sx={{minWidth: 650}}>
          <TableHead>
            <TableRow>
              <TableCell align=""></TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {services
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell>
                    <ListItem key={index} dense style={{marginLeft: '2%'}}>
                      {row.batteriskift ? (
                        <img
                          width="30"
                          height="30"
                          align="left"
                          style={{marginRight: '5px'}}
                          src="/LowBatteryIcon.png"
                        />
                      ) : row.tilsyn ? (
                        <img
                          width="30"
                          height="30"
                          align="left"
                          style={{marginRight: '5px'}}
                          src="/EyeIcon.png"
                        />
                      ) : (
                        ''
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
                        secondary={moment(row.dato).format('YYYY-MM-DD HH:mm')}
                      />
                      {row.kommentar}
                    </ListItem>
                  </TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        handleEdit(row);
                      }}
                      disabled={!canEdit}
                      size="large"
                    >
                      <EditIcon />
                    </IconButton>
                  </TableCell>
                  <TableCell align="left">
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

function MobileTilsyn({services, handleEdit, handleDelete, canEdit}) {
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
        <Grid item xs={5}>
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
                  style={{marginRight: '5px'}}
                  src="/LowBatteryIcon.png"
                />
              ) : row.tilsyn ? (
                <img
                  width="30"
                  height="30"
                  align="left"
                  style={{marginRight: '5px'}}
                  src="/EyeIcon.png"
                />
              ) : (
                ''
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
                secondary={moment(row.dato).format('YYYY-MM-DD HH:mm')}
              />
              <ListItemSecondaryAction>
                <IconButton
                  edge="end"
                  onClick={() => {
                    handleEdit(row);
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
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? (
    <TilsynTableMobile
      data={props.services}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
    />
  ) : (
    <TilsynTableDesktop
      data={props.services}
      handleEdit={props.handleEdit}
      handleDelete={props.handleDelete}
      canEdit={props.canEdit}
    />
  );
}
