import React, { useState } from "react";
import List from "@mui/material/List";
import ListItem from "@mui/material/ListItem";
import ListItemText from "@mui/material/ListItemText";
import Typography from "@mui/material/Typography";
import IconButton from "@mui/material/IconButton";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import DeleteAlert from "./DeleteAlert";
import ListItemSecondaryAction from "@mui/material/ListItemSecondaryAction";
import { Fragment } from "react";
import moment from "moment";
import TablePagination from "@mui/material/TablePagination";
import Box from "@mui/material/Box";
import Grid from "@mui/material/Grid";

export default function MobileMeasurements({
  measurements,
  handleEdit,
  handleDelete,
  canEdit,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [page, setPage] = React.useState(0);
  const rowsPerPage = 3;
  const onDeleteBtnClick = (id) => {
    setMeasurementId(id);
    setDialogOpen(true);
  };

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
        <Grid item xs={5} style={{ marginTop: "2.5%" }}>
          {/* <img width="30" height="30" align="left" src={process.env.PUBLIC_URL + "/RulerIcon.svg"} /> */}
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
                  border={1}
                  borderRadius="8px"
                  bgcolor="rgb(237, 237, 237)"
                  width="100%"
                  paddingLeft={1.5}
                >
                  <Typography variant="h6" display="inline">
                    <bold>{row.disttowatertable_m + " m "}</bold>
                  </Typography>
                  <Typography color="#868686" variant="h7" display="inline">
                    {moment(row.timeofmeas).format("YYYY-MM-DD HH:mm")}
                  </Typography>
                  <ListItemSecondaryAction>
                    {row.organisationid == sessionStorage.getItem("orgid") && (
                      <IconButton
                        edge="end"
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
                    )}
                    {row.organisationid == sessionStorage.getItem("orgid") && (
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
