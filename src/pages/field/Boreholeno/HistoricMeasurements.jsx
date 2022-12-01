import React, {useState} from 'react';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TableRow from '@mui/material/TableRow';
import TablePagination from '@mui/material/TablePagination';
import {IconButton, Typography} from '@mui/material';
import DeleteAlert from './DeleteAlert';
import {Fragment} from 'react';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import moment from 'moment';
import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Grid from '@mui/material/Grid';
import StraightenIcon from '@mui/icons-material/Straighten';
import {authStore} from 'src/state/store';

export default function HistoricMeasurements({measurements, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const [organisation] = authStore((state) => [state.organisation]);

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

  return (
    <div>
      <Fragment>
        <DeleteAlert
          measurementId={measurementId}
          dialogOpen={dialogOpen}
          setDialogOpen={setDialogOpen}
          onOkDelete={deleteRow}
        />
        <Grid container style={{marginLeft: '2%'}}>
          <StraightenIcon style={{marginTop: '0.25%', transform: 'rotate(90deg)'}} />
          <Grid item xs={8}>
            <Typography gutterBottom variant="h5" component="h2">
              Kontrolmålinger
            </Typography>
          </Grid>
          <Grid item xs={3} style={{marginLeft: '5%'}}>
            <TablePagination
              rowsPerPageOptions={[5]}
              component="div"
              count={measurements.length}
              rowsPerPage={rowsPerPage}
              page={page}
              onPageChange={handleChangePage}
              marginLeft="auto"
            />
          </Grid>
        </Grid>
        <TableContainer>
          <Table sx={{minWidth: 650}} aria-label="simple table">
            <TableHead>
              <TableRow>
                <TableCell align="center">Dato</TableCell>
                <TableCell align="center">Pumpestop</TableCell>
                <TableCell align="center">Pejling (nedstik) [m]</TableCell>
                <TableCell align="center">Organisation</TableCell>
                <TableCell align="center">Uploaded til Jupiter</TableCell>
                <TableCell align="center">Driftpejling</TableCell>
                <TableCell align="center">Kommentar</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurements
                .slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                .map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">
                      {moment(row.timeofmeas).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      {row.pumpstop !== null
                        ? moment(row.pumpstop).format('YYYY-MM-DD HH:mm')
                        : '-'}
                    </TableCell>
                    <TableCell align="center">{row.disttowatertable_m}</TableCell>
                    <TableCell align="center">
                      {row.organisationid !== null ? row.organisationname : '-'}
                    </TableCell>
                    <TableCell align="center">
                      {row.uploaded_status === true ? (
                        <CheckBoxIcon color="action"></CheckBoxIcon>
                      ) : (
                        <CheckBoxOutlineBlankIcon color="action"></CheckBoxOutlineBlankIcon>
                      )}
                    </TableCell>
                    <TableCell align="center">
                      {row.service === true ? ( //driftpejling
                        <CheckBoxIcon color="action"></CheckBoxIcon>
                      ) : (
                        <CheckBoxOutlineBlankIcon color="action"></CheckBoxOutlineBlankIcon>
                      )}
                    </TableCell>
                    <TableCell align="center">{row.comment}</TableCell>
                    <TableCell align="right">
                      {row.organisationid == organisation() && (
                        <IconButton
                          onClick={() => handleEdit(row)}
                          disabled={!canEdit}
                          size="large"
                        >
                          <EditIcon />
                        </IconButton>
                      )}
                    </TableCell>
                    <TableCell align="left">
                      {row.organisationid == organisation() && (
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
    </div>
  );
}
