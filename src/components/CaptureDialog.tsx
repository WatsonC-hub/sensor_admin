import CloseIcon from '@mui/icons-material/Close';
import {Typography} from '@mui/material';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Slide from '@mui/material/Slide';
import Toolbar from '@mui/material/Toolbar';
import {IDetectedBarcode, Scanner as QrReader} from '@yudiel/react-qr-scanner';
import React, {useEffect, useState} from 'react';

import {TransitionProps} from '@mui/material/transitions';
import NavBar from './NavBar';

const Transition = React.forwardRef(function Transition(
  props: TransitionProps & {children: React.ReactElement<any, any>},
  ref: React.Ref<unknown>
) {
  return <Slide direction="up" ref={ref} {...props} />;
});

let running = false;

// Different formats

//  "www.sensor.watsonc.dk/1234",
//  "https://sensor.watsonc.dk/1234",
//  "https://sensor.watsonc.dk/1234/"

function extractNumber(url: string) {
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

interface CaptureDialogProps {
  handleClose: () => void;
  handleScan: (url: string, calypso_id: number | null) => void;
  open: boolean;
}

export default function CaptureDialog({handleClose, handleScan, open}: CaptureDialogProps) {
  const [hasPermission, setHasPermission] = useState(true);
  async function handleScanning(raw_data: IDetectedBarcode[]) {
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
      console.log(navigator.permissions);
      navigator.permissions?.query({name: 'camera' as PermissionName}).then((permissionStatus) => {
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

  const handleError = (error: unknown) => console.error(error);

  return (
    <Dialog fullScreen open={open} onClose={handleClose} slots={{transition: Transition}}>
      <NavBar zIndex={1000}>
        <NavBar.Close onClick={handleClose} />
      </NavBar>
      <div
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexDirection: 'column',
        }}
      >
        {!hasPermission ? (
          <Typography variant="subtitle2" component="h3" align="center" display="block">
            Der skal gives rettigheder til at bruge kameraet. Tjek om du har fået en forespørgsel
            eller ændre indstillinger i din browser.
          </Typography>
        ) : (
          <QrReader
            scanDelay={100}
            onError={handleError}
            onScan={handleScanning}
            // onLoad={() => setShowText(false)}
            // constraints={{facingMode: 'environment', deviceId: 'environment'}}
            constraints={{
              facingMode: {
                ideal: 'environment',
              },
            }}
          />
        )}
      </div>
    </Dialog>
  );
}
