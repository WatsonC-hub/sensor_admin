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
  return <Slide direction="up" ref={props.ref} {...props} />;
}

let running = false;

// Different formats

//  "www.sensor.watsonc.dk/1234",
//  "https://sensor.watsonc.dk/1234",
//  "https://sensor.watsonc.dk/1234/"

function extractNumber(url) {
  try {
    // Ensure the URL has a valid format by adding "https://" if missing
    if (!url.startsWith('http')) {
      url = 'https://' + url;
    }

    // Use URL API to parse the path
    const urlObj = new URL(url);
    const path = urlObj.pathname.replace(/^\/|\/$/g, ''); // Remove leading/trailing slashes

    // Ensure the path is purely numeric
    return /^\d+$/.test(path) ? Number(path) : null;
  } catch {
    return null;
  }
}

export default function CaptureDialog({handleClose, handleScan, open}) {
  const [hasPermission, setHasPermission] = useState(true);

  async function handleScanning(raw_data) {
    if (raw_data !== null && !running) {
      const url = raw_data[0].rawValue;
      running = true;

      const calypso_id = extractNumber(url);

      await handleScan(url, calypso_id);

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
