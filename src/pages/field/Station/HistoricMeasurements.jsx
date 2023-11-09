import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StraightenIcon from '@mui/icons-material/Straighten';
import {IconButton, Typography} from '@mui/material';
import Grid from '@mui/material/Grid';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TableHead from '@mui/material/TableHead';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import moment from 'moment';
import React, {Fragment, useState} from 'react';
import DeleteAlert from 'src/components/DeleteAlert';
import {stamdataStore} from '../../../state/store';

export default function HistoricMeasurements({measurements, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;

  const [timeseries] = stamdataStore((state) => [state.timeseries]);

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
    0: 'Kontrol',
    1: 'Korrektion fremadrettet',
    2: 'Korrektion frem og tilbage til start af tidsserie',
    3: 'Lineær',
    4: 'Korrektion frem og tilbage til udstyr',
    5: 'Korrektion frem og tilbage til niveau spring',
    6: 'Korrektion frem og tilbage til forrige spring',
  };

  return (
    <Fragment>
      <DeleteAlert
        measurementId={measurementId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Grid container>
        <StraightenIcon style={{marginTop: '0.5%', transform: 'rotate(90deg)'}} />
        <Grid item xs={8}>
          <Typography gutterBottom variant="h5" component="h2">
            Kontrolmålinger
          </Typography>
        </Grid>
        <Grid item xs={3} style={{marginLeft: '5%'}}>
          <TablePagination
            rowsPerPageOptions={[5]}
            component="div"
            count={measurements?.length}
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
              <TableCell>Dato</TableCell>
              <TableCell align="right">
                {timeseries.tstype_id === 1
                  ? 'Pejling (nedstik) [m]'
                  : `Måling [${timeseries.unit}]`}
              </TableCell>
              <TableCell align="right">Anvendelse</TableCell>
              <TableCell align="right">Kommentar</TableCell>
            </TableRow>
          </TableHead>
          <TableBody>
            {measurements
              ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
              ?.map((row, index) => (
                <TableRow key={index}>
                  <TableCell component="th" scope="row">
                    {moment(row.timeofmeas).format('YYYY-MM-DD HH:mm')}
                  </TableCell>
                  <TableCell align="right">{row.measurement}</TableCell>
                  <TableCell align="right">
                    {correction_map[row.useforcorrection]
                      ? correction_map[row.useforcorrection]
                      : 'Kontrol'}
                  </TableCell>
                  <TableCell align="right">{row.comment}</TableCell>
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
    </Fragment>
  );
}
