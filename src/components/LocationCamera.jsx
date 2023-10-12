import CloseIcon from '@mui/icons-material/Close';
import AppBar from '@mui/material/AppBar';
import Dialog from '@mui/material/Dialog';
import IconButton from '@mui/material/IconButton';
import Toolbar from '@mui/material/Toolbar';
import React from 'react';
import Camera, {FACING_MODES, IMAGE_TYPES} from 'react-html5-camera-photo';

import 'react-html5-camera-photo/build/css/index.css';

function LocationCamera({open, handleClose, setDataURI}) {
  function handleCameraError(error) {
    console.log('handleCameraError', error);
  }

  function handleTakePhoto(dataUri) {
    setDataURI(dataUri);
    handleClose();
  }

  return (
    <div>
      <Dialog fullScreen open={open}>
        <AppBar>
          <Toolbar>
            <IconButton
              edge="start"
              color="inherit"
              onClick={handleClose}
              aria-label="close"
              size="large"
            >
              <CloseIcon />
            </IconButton>
          </Toolbar>
        </AppBar>
        <Camera
          onTakePhoto={(dataUri) => {
            handleTakePhoto(dataUri);
          }}
          onCameraError={(error) => {
            handleCameraError(error);
          }}
          idealFacingMode={FACING_MODES.ENVIRONMENT}
          idealResolution={{width: 640, height: 480}}
          imageType={IMAGE_TYPES.PNG}
          imageCompression={0.97}
          // isMaxResolution={true}
          isImageMirror={false}
          isSilentMode={false}
          isDisplayStartCameraError={true}
          // isFullscreen={true}
          sizeFactor={1}
        />
      </Dialog>
    </div>
  );
}

export default LocationCamera;
