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
import { StamdataContext } from "../../state/StamdataContext";

export default function MobileMeasurements({
  measurements,
  handleEdit,
  handleDelete,
  canEdit,
}) {
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const [, , stamdata, , , , , , , , ,] = React.useContext(StamdataContext);
  const onDeleteBtnClick = (id) => {
    setMeasurementId(id);
    setDialogOpen(true);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  return (
    <Fragment>
      <DeleteAlert
        measurementId={measurementId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <Typography gutterBottom variant="h5" component="h2">
        Kontrolmålinger
      </Typography>
      <Fragment>
        <List>
          {measurements.map((row, index) => (
            <ListItem key={index} dense>
              <ListItemText
                primary={moment(row.timeofmeas).format("YYYY-MM-DD HH:mm")}
                secondary={
                  row.measurement === null
                    ? "Måling ikke mulig"
                    : "Måling: " +
                      row.measurement +
                      " " +
                      (stamdata.station.tstype_id === 1
                        ? "m"
                        : stamdata.station.unit)
                }
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
                  size="large">
                  <EditIcon />
                </IconButton>
                <IconButton
                  edge="end"
                  onClick={() => onDeleteBtnClick(row.gid)}
                  disabled={!canEdit}
                  size="large">
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
