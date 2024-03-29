import {PhotoCameraRounded} from '@mui/icons-material';
import {Button, Grid} from '@mui/material';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useState} from 'react';
import {apiClient} from 'src/apiClient';
import {useImageUpload} from 'src/hooks/query/useImageUpload';
import ImageViewer from '../../../components/ImageViewer';
import SaveImageDialog from '../../../components/SaveImageDialog';

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

function StationImages(props) {
  const [openCamera, setOpenCamera] = useState(false);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);

  const [activeImage, setActiveImage] = useState({
    gid: -1,
    loc_id: props.locationId,
    comment: '',
    public: false,
    date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
  });

  const queryClient = useQueryClient();

  const {data: images} = useQuery(
    ['images', props.locationId], //() => getImage(props.locationId));
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/images/${props.locationId}`);
      return data;
    }
  );

  const {del: deleteImage} = useImageUpload('station');

  const handleFileRead = async (event) => {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    handleSetDataURI(base64);
  };

  const handleSetDataURI = (datauri) => {
    setdataUri(datauri);
    setActiveImage({
      gid: -1,
      loc_id: props.locationId,
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
      <SaveImageDialog
        activeImage={activeImage}
        changeData={changeActiveImageData}
        locationId={props.locationId}
        open={openSave}
        dataUri={dataUri}
        handleCloseSave={() => setOpenSave(false)}
      />
      <Grid container spacing={3} justifyContent="center">
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
              startIcon={<PhotoCameraRounded />}
            >
              Tag billede / Upload fil
            </Button>
          </label>
        </Grid>
        <Grid item xs={12} sm={12}>
          <ImageViewer
            // handleDelete={handleDelete}
            deleteMutation={deleteImage}
            handleEdit={handleEdit}
            images={images}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default StationImages;
