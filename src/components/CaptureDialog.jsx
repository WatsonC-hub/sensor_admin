import CloseIcon from '@mui/icons-material/Close';
import {Typography} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import {Scanner as QrReader} from '@yudiel/react-qr-scanner';
import React, {useEffect, useState} from 'react';
function Transition(props) {
  console.log(props);
  return <Slide direction="up" ref={props.ref} {...props} />;
}

let running = false;

export default function CaptureDialog({handleClose, handleScan, open}) {
  const [hasPermission, setHasPermission] = useState(true);

  async function handleScanning(data) {
    if (data !== null && !running) {
      running = true;

      await handleScan(data);

      running = false;

      // navigate(`${calypso_id}`);
    }
  }

  useEffect(() => {
    const intervalId = setInterval(() => {
      navigator.permissions?.query({name: 'camera'}).then((permissionStatus) => {
        if (permissionStatus.state == 'granted') {
          setHasPermission(true);
          clearInterval(intervalId);
        } else {
          setHasPermission(false);
        }
      });
    }, 1000);

    return () => clearInterval(intervalId);
  }, []);

  const camStyle = {
    marginTop: '56px',
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  };

  const handleError = (error) => console.error(error);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} slots={{transition: Transition}}>
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
        {!hasPermission ? (
          <Typography variant="subtitle2" component="h3" align="center" display="block">
            Der skal gives rettigheder til at bruge kameraet. Tjek om du har fået en forespørgsel
            eller ændre indstillinger i din browser.
          </Typography>
        ) : (
          <QrReader
            scanDelay={100}
            style={{paddingTop: '64px'}}
            onError={handleError}
            onScan={handleScanning}
            // onLoad={() => setShowText(false)}
            constraints={{video: {facingMode: 'environment'}}}
          />
        )}
      </div>
    </Dialog>
  );
}
