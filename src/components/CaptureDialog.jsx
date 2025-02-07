import CloseIcon from '@mui/icons-material/Close';
import {Typography} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import React, {useState} from 'react';
import QrReader from 'react-qr-scanner';
function Transition(props) {
  console.log(props);
  return <Slide direction="up" ref={props.ref} {...props} />;
}

var running = false;

export default function CaptureDialog({handleClose, handleScan, open}) {
  const [showText, setShowText] = useState(true);

  async function handleScanning(data) {
    if (data !== null && !running) {
      running = true;

      await handleScan(data);

      running = false;

      // navigate(`${calypso_id}`);
    }
  }

  const camStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  };

  const handleError = (error) => console.error(error);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} TransitionComponent={Transition}>
      <AppBar>
        <Toolbar>
          <IconButton
            edge="end"
            color="inherit"
            onClick={handleClose}
            aria-label="close"
            size="large"
          >
            <CloseIcon />
          </IconButton>
        </Toolbar>
      </AppBar>
      <div style={camStyle}>
        {showText && (
          <Typography variant="subtitle2" component="h3" align="center" display="block">
            Der skal gives rettigheder til at bruge kameraet. Tjek om du har fået en forespørgsel
            eller ændre indstillinger i din browser.
          </Typography>
        )}
        <QrReader
          delay={100}
          // style={previewStyle}
          onError={handleError}
          onScan={handleScanning}
          onLoad={() => setShowText(false)}
          constraints={{
            video: {
              facingMode: 'environment',
            },
          }}
        />
      </div>
    </Dialog>
  );
}
