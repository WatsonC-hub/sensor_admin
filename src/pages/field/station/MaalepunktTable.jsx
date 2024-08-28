import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StraightenIcon from '@mui/icons-material/Straighten';
import {Box, Typography} from '@mui/material';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
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

function DesktopMP({watlevmp, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

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
        <StraightenIcon style={{marginTop: '0.3%', transform: 'rotate(90deg)'}} />
        <Grid item xs={8}>
          <Typography gutterBottom variant="h5" component="h2">
            Målepunkter
          </Typography>
        </Grid>
      </Grid>
      <TableContainer>
        <Table aria-label="simple table" sx={{minWidth: 650}}>
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
                    {moment(row.startdate).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell>{moment(row.enddate).format('YYYY-MM-DD HH:mm')}</TableCell>
                  <TableCell align="right">{row.elevation}</TableCell>
                  <TableCell align="right">{row.mp_description}</TableCell>
                  <TableCell align="right">
                    <IconButton
                      onClick={() => {
                        handleEdit(row);
                        setTimeout(() => {
                          window.scrollTo({top: 300, behavior: 'smooth'});
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

function MobileMP({watlevmp, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [page, setPage] = React.useState(0);
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
        <Grid item xs={5} style={{marginTop: '2.5%'}}>
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
              <Box
                borderColor="rgb(237, 237, 237)"
                borderRadius={8}
                bgcolor="rgb(237, 237, 237)"
                width="100%"
                paddingLeft={1.5}
              >
                <Typography variant="h6" display="inline">
                  <bold>{row.elevation + ' m '}</bold>
                </Typography>
                <Typography variant="h7" display="inline" color="#868686">
                  {row.startdate.split(' ')[0] + ' - ' + row.enddate.split(' ')[0]}
                </Typography>

                {/* <ListItemText
                primary={'Målepunkt: ' + row.elevation + ' m'}
                secondary={row.startdate.split(' ')[0] + ' - ' + row.enddate.split(' ')[0]}
              /> */}
                <ListItemSecondaryAction>
                  <IconButton
                    edge="end"
                    onClick={() => {
                      handleEdit(row);
                      setTimeout(() => {
                        window.scrollTo({top: 300, behavior: 'smooth'});
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
                    style={{marginRight: '2px'}}
                  >
                    <DeleteIcon />
                  </IconButton>
                </ListItemSecondaryAction>
              </Box>
            </ListItem>
          ))}
        </List>
      </Fragment>
    </Fragment>
  );
}

export default function MaalepunktTable(props) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down('sm'));

  return matches ? <MobileMP {...props} /> : <DesktopMP {...props} />;
}
