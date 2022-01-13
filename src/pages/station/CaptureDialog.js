import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import QrReader from "react-qr-scanner";
import { useHistory } from "react-router-dom";
import { Typography } from "@material-ui/core";

const useStyles = makeStyles((theme) => ({
  appBar: {
    position: "relative",
    backgroundColor: "lightseagreen",
  },
  title: {
    marginLeft: theme.spacing(2),
    flex: 1,
  },
}));

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CaptureDialog({ handleClose, open }) {
  const classes = useStyles();
  const history = useHistory();

  const [showText, setShowText] = useState(true);

  const handleScan = (data) => {
    if (data !== null) {
      const calypso_id = data["text"].split("/")[3];
      console.log(calypso_id);
      handleClose();
      history.push(`${calypso_id}`);
    }
  };

  const camStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    flexDirection: "column",
  };

  const previewStyle = {
    height: 600,
    width: 300,
    display: "flex",
    justifyContent: "center",
  };

  const handleError = (error) => console.error(error);

  return (
    <Dialog
      fullScreen
      open={open}
      onClose={handleClose}
      TransitionComponent={Transition}
    >
      <AppBar className={classes.appBar}>
        <Toolbar>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={camStyle}>
        {showText && (
          <Typography
            variant="subtitle2"
            component="h3"
            align="center"
            display="block"
          >
            Der skal gives rettigheder til at bruge kameraet. Tjek om du har
            fået en forespørgsel eller ændre indstillinger i din browser.
          </Typography>
        )}
        <QrReader
          delay={100}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
          onLoad={(e) => setShowText(false)}
          facingMode="environment"
        />
      </div>
    </Dialog>
  );
}
