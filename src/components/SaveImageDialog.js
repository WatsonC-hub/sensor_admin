import React, { useState } from "react";
import { postImage, updateImage } from "../api";
import { TextField, Typography, Grid, Button } from "@material-ui/core";
import Checkbox from "@material-ui/core/Checkbox";
import FormControlLabel from "@material-ui/core/FormControlLabel";
import moment from "moment";
import Dialog from "@material-ui/core/Dialog";
import DialogActions from "@material-ui/core/DialogActions";
import DialogContent from "@material-ui/core/DialogContent";
import DialogTitle from "@material-ui/core/DialogTitle";
import OwnDatePicker from "./OwnDatePicker";

function SaveImageDialog({
  activeImage,
  changeData,
  locationId,
  open,
  dataUri,
  photoTrigger,
  handleCloseSave,
}) {
  function saveImage() {
    let sessionId = sessionStorage.getItem("session_id");
    const payload = {
      loc_id: locationId,
      comment: activeImage.comment,
      public: activeImage.public.toString(),
      date: moment(activeImage.date).format("YYYY-MM-DD HH:mm"),
    };
    console.log(payload);
    if (activeImage.gid === -1) {
      postImage(payload, dataUri, sessionId).then((resp) => {
        console.log(resp);
        photoTrigger((prev) => !prev);
        handleCloseSave();
      });
    } else {
      updateImage(activeImage.gid, payload, sessionId).then((resp) => {
        console.log(resp);
        photoTrigger((prev) => !prev);
        handleCloseSave();
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseSave}
      fullWidth={true}
      maxWidth="lg"
    >
      <DialogTitle id="form-dialog-title">Gem billede</DialogTitle>
      <DialogContent>
        <Grid container spacing={3}>
          <Grid item xs={24} sm={12}>
            <img
              src={dataUri}
              style={{ minWidth: "300", minHeight: "400", maxWidth: "1000" }}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <TextField
              label={
                <Typography variant="h6" component="h3">
                  Kommentar
                </Typography>
              }
              value={activeImage.comment}
              variant="outlined"
              multiline
              rows={4}
              InputLabelProps={{ shrink: true }}
              fullWidth
              onChange={(event) => changeData("comment", event.target.value)}
            />
          </Grid>
          <Grid item xs={12} sm={6}>
            <FormControlLabel
              control={
                <Checkbox
                  checked={activeImage.public}
                  onChange={(event) =>
                    changeData("public", event.target.checked)
                  }
                  name="checkedBattery"
                  color="primary"
                />
              }
              label={<label>Offentliggør på Calypso</label>}
            />
            <OwnDatePicker
              label={"Dato"}
              value={activeImage.date}
              onChange={(date) =>
                changeData("date", moment(date).format("YYYY-MM-DD HH:mm"))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button onClick={saveImage} color="secondary" variant="contained">
          Tilføj
        </Button>
        <Button onClick={handleCloseSave} color="secondary" variant="contained">
          Annuller
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveImageDialog;
