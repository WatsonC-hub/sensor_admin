import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
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
import {authStore} from 'src/state/store';
import {stamdataStore} from '../../../state/store';

export default function HistoricMeasurements({measurements, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 5;
  const [org_id] = authStore((state) => [state.org_id]);

  const hasUnit = stamdataStore((state) => !state.isEmpty);

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
    2: 'Korrektion frem og tilbage',
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
                {hasUnit && <TableCell align="center">Anvendelse</TableCell>}
                <TableCell align="center">Kommentar</TableCell>
                <TableCell align="center"></TableCell>
                <TableCell align="center"></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {measurements
                ?.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                ?.map((row, index) => (
                  <TableRow key={index}>
                    <TableCell align="center">
                      {moment(row.timeofmeas).format('YYYY-MM-DD HH:mm')}
                    </TableCell>
                    <TableCell align="center">
                      {row.pumpstop !== null
                        ? moment(row.timeofmeas).diff(moment(row.pumpstop), 'hours') +
                          ' timer siden'
                        : row.service === true
                        ? 'I drift'
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
                    {/* <TableCell align="center">
                      {row.service === true ? ( //driftpejling
                        <CheckBoxIcon color="action"></CheckBoxIcon>
                      ) : (
                        <CheckBoxOutlineBlankIcon color="action"></CheckBoxOutlineBlankIcon>
                      )}
                    </TableCell> */}
                    {hasUnit && (
                      <TableCell align="right">
                        {correction_map[row.useforcorrection]
                          ? correction_map[row.useforcorrection]
                          : 'Kontrol'}
                      </TableCell>
                    )}
                    <TableCell align="center">{row.comment}</TableCell>
                    <TableCell align="right">
                      {row.organisationid == org_id && (
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
    </div>
  );
}
