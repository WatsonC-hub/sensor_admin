import React, { useState } from "react";
import { postImage, updateImage } from "../api";
import {
  TextField,
  Typography,
  Grid,
  Button,
  CircularProgress,
} from "@mui/material";
import Checkbox from "@mui/material/Checkbox";
import FormControlLabel from "@mui/material/FormControlLabel";
import moment from "moment";
import Dialog from "@mui/material/Dialog";
import DialogActions from "@mui/material/DialogActions";
import DialogContent from "@mui/material/DialogContent";
import DialogTitle from "@mui/material/DialogTitle";
import OwnDatePicker from "./OwnDatePicker";
import useMediaQuery from "@mui/material/useMediaQuery";
import { useTheme } from "@mui/material/styles";

function SaveImageDialog({
  activeImage,
  changeData,
  locationId,
  open,
  dataUri,
  photoTrigger,
  handleCloseSave,
}) {
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));
  const [disableAdd, setDisableAdd] = useState(false);
  const baseUrl =
    "https://calypsoimages.s3.eu-north-1.amazonaws.com/location_images/";
  const imageUrl = baseUrl + activeImage.imageurl + ".png";

  function saveImage() {
    let sessionId = sessionStorage.getItem("session_id");
    const payload = {
      loc_id: locationId,
      comment: activeImage.comment,
      public: activeImage.public.toString(),
      date: moment(activeImage.date).format("YYYY-MM-DD HH:mm"),
    };
    console.log(payload);
    setDisableAdd(true);
    if (activeImage.gid === -1) {
      postImage(payload, dataUri, sessionId).then((resp) => {
        console.log(resp);
        photoTrigger((prev) => !prev);
        handleCloseSave();
        setDisableAdd(false);
      });
    } else {
      updateImage(activeImage.gid, payload, sessionId).then((resp) => {
        console.log(resp);
        photoTrigger((prev) => !prev);
        handleCloseSave();
        setDisableAdd(false);
      });
    }
  }

  return (
    <Dialog
      open={open}
      onClose={handleCloseSave}
      fullWidth={true}
      maxWidth="lg"
      fullScreen={matches}
    >
      <DialogTitle id="form-dialog-title">Gem billede</DialogTitle>
      <DialogContent>
        <Grid container spacing={3} style={{ width: "100%" }}>
          <Grid item xs={12} sm={12} style={{ width: "100%" }}>
            <img
              src={activeImage.gid === -1 ? dataUri : imageUrl}
              style={{ width: "100%" }}
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
              value={moment(activeImage.date)}
              onChange={(date) =>
                changeData("date", moment(date).format("YYYY-MM-DD HH:mm"))
              }
            />
          </Grid>
        </Grid>
      </DialogContent>
      <DialogActions>
        <Button
          onClick={saveImage}
          disabled={disableAdd}
          color="secondary"
          variant="contained"
        >
          {disableAdd ? <CircularProgress /> : "Tilføj"}
        </Button>
        <Button onClick={handleCloseSave} color="secondary" variant="contained">
          Annuller
        </Button>
      </DialogActions>
    </Dialog>
  );
}

export default SaveImageDialog;
