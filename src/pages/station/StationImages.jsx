import React, { useEffect, useState } from "react";
import LocationCamera from "../../components/LocationCamera";
import { Button } from "@mui/material";
import ImageViewer from "../../components/ImageViewer";
import { PhotoCameraRounded } from "@mui/icons-material";
import { Grid } from "@mui/material";
import SaveImageDialog from "../../components/SaveImageDialog";
import { deleteImage, getImage } from "../../api";
import moment from "moment";

function StationImages(props) {
  const [openCamera, setOpenCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [dataUri, setdataUri] = useState("");
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    loc_id: props.locationId,
    comment: "",
    public: false,
    date: moment(new Date()).format("YYYY-MM-DD HH:mm"),
  });
  const [images, setImages] = useState([]);

  useEffect(() => {
    getImage(props.locationId).then((res) => {
      setImages(res.data.data);
    });
  }, [props.locationId, photoTaken]);

  const triggerPhoto = () => {
    setPhotoTaken((prev) => !prev);
  };

  const handleClose = () => {
    setOpenCamera(false);
  };

  const handleCloseSave = () => {
    setOpenSave(false);
  };

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
      loc_id: props.locationId,
      comment: "",
      public: false,
      date: moment(new Date()).format("YYYY-MM-DD HH:mm"),
    });
    setOpenSave(true);
  };

  const handleDelete = (image) => {
    let sessionId = sessionStorage.getItem("session_id");
    return deleteImage(image.loc_id, image.gid, sessionId).then((res) => {
      triggerPhoto();
    });
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
    console.log(activeImage);
  };

  return (
    <div>
      <LocationCamera
        open={openCamera}
        handleClose={handleClose}
        setDataURI={handleSetDataURI}
      />
      <SaveImageDialog
        activeImage={activeImage}
        changeData={changeActiveImageData}
        locationId={props.locationId}
        open={openSave}
        dataUri={dataUri}
        photoTrigger={triggerPhoto}
        handleCloseSave={handleCloseSave}
      />
      <Grid container spacing={3}>
        {/* <Grid item xs={6} sm={2}>
          <Button
            autoFocus
            color="secondary"
            variant="contained"
            onClick={() => setOpenCamera((prev) => !prev)}
            startIcon={<PhotoCameraRounded />}
          >
            {openCamera ? "Luk kamera" : "Tag billede"}
          </Button>
        </Grid> */}
        <Grid item xs={6} sm={2}>
          <label htmlFor="btn-upload">
            <input
              id="btn-upload"
              name="btn-upload"
              style={{
                display: "none",
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
            handleDelete={handleDelete}
            handleEdit={handleEdit}
            images={images}
          />
        </Grid>
      </Grid>
    </div>
  );
}

export default StationImages;
