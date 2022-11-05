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

const Transition = React.forwardRef(function Transition(props, ref) {
  return <Slide direction="up" ref={ref} {...props} />;
});

export default function CaptureDialog({handleClose, open}) {
  // const classes = useStyles();
  const navigate = useNavigate();

  const [showText, setShowText] = useState(true);

  const handleScan = data => {
    if (data !== null) {
      const calypso_id = data['text'].split('/')[3];
      console.log(calypso_id);
      handleClose();
      navigate(`${calypso_id}`);
    }
  };

  const camStyle = {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'column',
  };

  const previewStyle = {
    height: 600,
    width: 300,
    display: 'flex',
    justifyContent: 'center',
  };

  const handleError = error => console.error(error);

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
          style={previewStyle}
          onError={handleError}
          onScan={handleScan}
          onLoad={e => setShowText(false)}
          facingMode="environment"
        />
      </div>
    </Dialog>
  );
}
