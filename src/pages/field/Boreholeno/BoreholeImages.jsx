import React, { useEffect, useState } from "react";
import LocationCamera from "../../components/LocationCamera";
import { Button } from "@mui/material";
import ImageViewer from "../../components/ImageViewer";
import { PhotoCameraRounded } from "@mui/icons-material";
import { Grid } from "@mui/material";
import SaveImageDialog from "../../components/SaveImageDialog";
import { deleteImage, getImage } from "src/pages/field/fieldAPI";
import moment from "moment";
import DeleteAlert from "./DeleteAlert";
import { useTheme } from "@mui/material/styles";
import useMediaQuery from "@mui/material/useMediaQuery";

function BoreholeImages(props) {
  const [openCamera, setOpenCamera] = useState(false);
  const [photoTaken, setPhotoTaken] = useState(false);
  const [dataUri, setdataUri] = useState("");
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    boreholeno: props.boreholeno,
    comment: "",
    public: false,
    date: moment(new Date()).format("YYYY-MM-DD HH:mm"),
  });
  const [images, setImages] = useState([]);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [measurementId, setMeasurementId] = useState(-1);
  const theme = useTheme();
  const matches = useMediaQuery(theme.breakpoints.down("md"));

  useEffect(() => {
    getImage(props.boreholeno).then((res) => {
      setImages(res.data.data);
    });
  }, [props.boreholeno, photoTaken]);

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
      boreholeno: props.boreholeno,
      comment: "",
      public: false,
      date: moment(new Date()).format("YYYY-MM-DD HH:mm"),
    });
    setOpenSave(true);
  };

  const handleDelete = (image, id) => {
    let sessionId = sessionStorage.getItem("session_id");
    setMeasurementId(id);
    setDialogOpen(true);
    setTimeout(() => {
      setDialogOpen(false);
    }, 500);
    return deleteImage(image.boreholeno, image.gid, sessionId).then((res) => {
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
    console.log(images);
  };

  const deleteRow = (id) => {
    handleDelete(id);
  };

  return (
    <div>
      <DeleteAlert
        measurementId={measurementId}
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteRow}
      />
      <LocationCamera
        open={openCamera}
        handleClose={handleClose}
        setDataURI={handleSetDataURI}
      />
      <SaveImageDialog
        activeImage={activeImage}
        changeData={changeActiveImageData}
        boreholeno={props.boreholeno}
        open={openSave}
        dataUri={dataUri}
        photoTrigger={triggerPhoto}
        handleCloseSave={handleCloseSave}
      />
      <Grid container spacing={3} justifyContent={"center"}>
        <Grid item>
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
              style={{ marginTop: "5%" }}
              startIcon={<PhotoCameraRounded />}
            >
              Upload billede
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

export default BoreholeImages;
