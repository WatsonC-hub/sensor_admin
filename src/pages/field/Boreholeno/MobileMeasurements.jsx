import DeleteIcon from '@mui/icons-material/Delete';
import EditIcon from '@mui/icons-material/Edit';
import StraightenIcon from '@mui/icons-material/Straighten';
import Box from '@mui/material/Box';
import Grid from '@mui/material/Grid';
import IconButton from '@mui/material/IconButton';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemSecondaryAction from '@mui/material/ListItemSecondaryAction';
import TablePagination from '@mui/material/TablePagination';
import Typography from '@mui/material/Typography';
import moment from 'moment';
import React, {Fragment, useState} from 'react';
import DeleteAlert from '~/components/DeleteAlert';
import {authStore} from '~/state/store';

export default function MobileMeasurements({measurements, handleEdit, handleDelete, canEdit}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 3;
  const onDeleteBtnClick = (id) => {
    setMeasurementId(id);
    setDialogOpen(true);
  };

  const [org_id] = authStore((state) => [state.org_id]);

  const deleteRow = (id) => {
    handleDelete(id);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
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
          <StraightenIcon style={{marginTop: '0.5%', transform: 'rotate(90deg)'}} />
          <Typography gutterBottom variant="h6" component="h2">
            Kontrolmålinger
          </Typography>
        </Grid>
        <Grid item xs={7}>
          <TablePagination
            rowsPerPageOptions={[3]}
            component="div"
            count={measurements.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
          />
        </Grid>
      </Grid>
      <Fragment>
        <List>
          {measurements
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
                    {row.disttowatertable_m !== null
                      ? row.disttowatertable_m + ' m '
                      : 'Ikke mulig '}
                  </Typography>
                  <Typography color="#868686" variant="h7" display="inline">
                    {moment(row.timeofmeas).format('YYYY-MM-DD HH:mm')}
                  </Typography>
                  <ListItemSecondaryAction>
                    {row.organisationid == org_id && (
                      <IconButton
                        edge="end"
                        onClick={() => {
                          handleEdit(row);
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
