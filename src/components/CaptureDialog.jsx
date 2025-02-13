import CloseIcon from '@mui/icons-material/Close';
import {Typography} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import React, {useState} from 'react';
import QrReader from 'react-qr-scanner';
const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

var running = false;

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
  } catch (error) {
    return null;
  }
}

export default function CaptureDialog({handleClose, handleScan, open}) {
  const [showText, setShowText] = useState(true);

  async function handleScanning(raw_data) {
    if (raw_data !== null && !running) {
      running = true;

      const calypso_id = extractNumber(raw_data);

      await handleScan(raw_data, calypso_id);

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
          constraints={{video: {facingMode: 'environment'}}}
        />
      </div>
    </Dialog>
  );
}
