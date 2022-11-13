import React, {useEffect, useState} from 'react';
import LocationCamera from '../../../components/LocationCamera';
import {Button} from '@mui/material';
import ImageViewer from '../../../components/ImageViewer';
import {PhotoCameraRounded} from '@mui/icons-material';
import {Grid} from '@mui/material';
import SaveImageDialogBorehole from './components/SaveImageDialogBorehole';
import {deleteImage, getImage} from 'src/pages/field/boreholeAPI';
import moment from 'moment';
import {useQuery, useQueryClient, useMutation} from '@tanstack/react-query';

function BoreholeImages(props) {
  const [openCamera, setOpenCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    boreholeno: props.boreholeno,
    comment: '',
    public: false,
    date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
  });
  const queryClient = useQueryClient();

  const {data: images} = useQuery(['images', props.boreholeno], () => getImage(props.boreholeno));
  console.log(images);
  const deleteImageMutation = useMutation((gid) => deleteImage(props.boreholeno, gid), {
    onSuccess: () => {
      queryClient.invalidateQueries(['images', props.boreholeno]);
    },
  });

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleFileRead = async (event) => {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    handleSetDataURI(base64);
  };

  const handleSetDataURI = (datauri) => {
    setdataUri(datauri);
    setActiveImage({
      gid: -1,
      boreholeno: props.boreholeno,
      comment: '',
      public: false,
      date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
    });
    setOpenSave(true);
  };

  const changeActiveImageData = (field, value) => {
    setActiveImage({
      ...activeImage,
      [field]: value,
    });
  };

  const handleEdit = (image) => {
    setActiveImage(image);
    setOpenSave(true);
  };

  return (
    <div>
      <LocationCamera
        open={openCamera}
        handleClose={() => setOpenCamera(false)}
        setDataURI={handleSetDataURI}
      />
      <SaveImageDialogBorehole
        activeImage={activeImage}
        changeData={changeActiveImageData}
        boreholeno={props.boreholeno}
        open={openSave}
        dataUri={dataUri}
        handleCloseSave={() => setOpenSave(false)}
      />
      <Grid container spacing={3} justifyContent={'center'}>
        <Grid item>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{
                display: 'none',
              }}
              type="file"
              onChange={(event) => handleFileRead(event)}
            />
            <Button
              color="secondary"
              variant="contained"
              component="span"
              style={{marginTop: '5%'}}
              startIcon={<PhotoCameraRounded />}
            >
              Upload billede
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} sm={12}>
          <ImageViewer
            deleteMutation={deleteImageMutation}
            handleEdit={handleEdit}
            images={images}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default BoreholeImages;
