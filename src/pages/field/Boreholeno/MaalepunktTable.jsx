import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StraightenIcon from '@mui/icons-material/Straighten';
import {Typography} from '@mui/material';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import {useTheme} from '@mui/material/styles';
import useMediaQuery from '@mui/material/useMediaQuery';
import moment from 'moment';
import React, {Fragment, useState} from 'react';
import DeleteAlert from 'src/components/DeleteAlert';
import {authStore} from 'src/state/store';

function DesktopMP({watlevmp, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

  const [org_id] = authStore((state) => [state.org_id]);

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
        <StraightenIcon style={{marginTop: '0.25%', transform: 'rotate(90deg)'}} />
        <Grid item xs={8}>
          <Typography gutterBottom variant="h5" component="h2">
            Målepunkter
          </Typography>
        </Grid>
        <Grid item xs={3} style={{marginLeft: '5%'}}>
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={watlevmp.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Grid>
      </Grid>
      <TableContainer>
        <Table sx={{minWidth: 600}} aria-label="simple table">
          <TableHead>
            <TableRow>
              <TableCell align="center">Start dato</TableCell>
              <TableCell align="center">Slut dato</TableCell>
              <TableCell align="center">Målepunktskote [m]</TableCell>
              <TableCell align="center">Organisation</TableCell>
              <TableCell align="center">Beskrivelse</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {watlevmp
              .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              .map((row, index) => (
                <TableRow key={index}>
                  <TableCell align="center">
                    {moment(row.startdate).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell align="center">
                    {moment(row.enddate).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell align="center">{row.elevation}</TableCell>
                  <TableCell align="center">
                    {row.organisationid !== null ? row.organisationname : 'null'}
                  </TableCell>
                  <TableCell align="center">{row.mp_description}</TableCell>
                  <TableCell align="right">
                    {row.organisationid == org_id && (
                      <IconButton onClick={() => handleEdit(row)} disabled={!canEdit} size="large">
                        <EditIcon />
                      </IconButton>
                    )}
                  </TableCell>
                  <TableCell align="left">
                    {row.organisationid == org_id && (
                      <IconButton
                        onClick={() => {
                          onDeleteBtnClick(row.gid);
                        }}
                        disabled={!canEdit}
                        size="large"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
                  </TableCell>
                </TableRow>
              ))}
          </TableBody>
        </Table>
      </TableContainer>
    </Fragment>
  );
}

function MobileMP({watlevmp, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [mpId, setMpId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 3;

  const [org_id] = authStore((state) => [state.org_id]);

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
        <Grid
          item
          xs={4}
          sx={{
            justifyContent: 'center',
            alignItems: 'center',
            display: 'flex',
            mt: '2.5%',
            ml: 3,
          }}
        >
          <StraightenIcon style={{marginTop: '0.25%', transform: 'rotate(90deg)'}} />
          <Typography gutterBottom variant="h5" component="h2">
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
          {watlevmp
            .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
            .map((row, index) => (
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
                  <Typography color="#868686" variant="h7" display="inline">
                    {row.startdate.split('T')[0] + ' - ' + row.enddate.split('T')[0]}
                  </Typography>
                  <ListItemSecondaryAction>
                    {row.organisationid == org_id && (
                      <IconButton
                        edge="end"
                        onClick={() => {
                          handleEdit(row);
                          setTimeout(() => {
                            window.scrollTo({top: 550, behavior: 'smooth'});
                          }, 200);
                        }}
                        disabled={!canEdit}
                        size="large"
                      >
                        <EditIcon />
                      </IconButton>
                    )}
                    {row.organisationid == org_id && (
                      <IconButton
                        edge="end"
                        onClick={() => onDeleteBtnClick(row.gid)}
                        disabled={!canEdit}
                        size="large"
                      >
                        <DeleteIcon />
                      </IconButton>
                    )}
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
