import React, {useState} from 'react';
import Dialog from '@mui/material/Dialog';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import CloseIcon from '@mui/icons-material/Close';
import Slide from '@mui/material/Slide';
import QrReader from 'react-qr-scanner';
import {useNavigate} from 'react-router-dom';
import {Typography} from '@mui/material';
import {apiClient} from 'src/pages/field/fieldAPI';
import {toast} from 'react-toastify';

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

var running = false;

export default function CaptureDialog({handleClose, open}) {
  async function getData(labelid) {
    const {data} = await apiClient.get(`/sensor_field/calypso_id/${labelid}`);
    return data;
  }

  const navigate = useNavigate();

  const [showText, setShowText] = useState(true);

  async function handleScan(data) {
    if (data !== null && !running) {
      running = true;
      const calypso_id = data['text'].split('/')[3];
      console.log(calypso_id);

      try {
        const resp = await getData(calypso_id);

        if (resp.loc_id) {
          if (resp.ts_id) {
            navigate(`/field/location/${resp.loc_id}/${resp.ts_id}`);
          } else {
            navigate(`/field/location/${resp.loc_id}`);
          }
        } else if (resp.boreholeno) {
          if (resp.intakeno) {
            navigate(`/field/borehole/${resp.boreholeno}/${resp.intakeno}`);
          } else {
            navigate(`/field/borehole/${resp.boreholeno}`);
          }
        } else {
          toast.error('Ukendt fejl', {
            autoClose: 2000,
          });
        }
        handleClose();
      } catch (e) {
        console.log(e);
        handleClose();
        toast.error(e.response?.data?.detail ? e.response?.data?.detail : 'Ukendt fejl', {
          autoClose: 2000,
        });
      }

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
          onScan={handleScan}
          onLoad={(e) => setShowText(false)}
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
