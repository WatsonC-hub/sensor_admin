import React, { useState } from "react";
import Dialog from "@material-ui/core/Dialog";
import Button from "@material-ui/core/Button";
import AppBar from "@material-ui/core/AppBar";
import Toolbar from "@material-ui/core/Toolbar";
import { makeStyles } from "@material-ui/core/styles";
import IconButton from "@material-ui/core/IconButton";
import Typography from "@material-ui/core/Typography";
import CloseIcon from "@material-ui/icons/Close";
import Slide from "@material-ui/core/Slide";
import QrReader from "react-qr-scanner";

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
  return <Slide direction='up' ref={ref} {...props} />;
});

export default function CaptureDialog({ handleClose, open }) {
  const classes = useStyles();
  //   const [open, setOpen] = React.useState(false);

  //   const handleClickOpen = () => {
  //     setOpen(true);
  //   };

  //   const handleClose = () => {
  //     setOpen(false);
  //   };
  const [result, setResult] = useState("no result");

  const handleScan = (data) => {
    if (data !== null) {
      setResult(data["text"]);
      console.log(data);
      return;
    }
  };

  const camStyle = {
    display: "flex",
    justifyContent: "center",
    alignItems: "center",
    // marginTop: "-50px",
    flexDirection: "column",
  };

  const previewStyle = {
    height: 300,
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
            edge='end'
            color='inherit'
            onClick={handleClose}
            aria-label='close'
          >
            <CloseIcon />
          </IconButton>
          {/* <Typography variant='h6' className={classes.title}>
            Sound
          </Typography> */}
          {/* <Button autoFocus color='inherit' onClick={handleClose}>
            save
          </Button> */}
        </Toolbar>
      </AppBar>
      <div style={camStyle}>
        <QrReader
          delay={100}
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
        />
        <p>{result}</p>
      </div>
    </Dialog>
  );
}
