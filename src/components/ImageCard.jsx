import React, { useState } from "react";
import Card from "@mui/material/Card";
import CardActionArea from "@mui/material/CardActionArea";
import CardActions from "@mui/material/CardActions";
import CardContent from "@mui/material/CardContent";
import CardMedia from "@mui/material/CardMedia";
import Button from "@mui/material/Button";
import Typography from "@mui/material/Typography";
import DeleteAlert from "../pages/station/DeleteAlert";
import CircularProgress from "@mui/material/CircularProgress";
import moment from "moment";

function ImageCard({ image, handleDelete, handleEdit }) {
  const baseUrl =
    "https://calypsoimages.s3.eu-north-1.amazonaws.com/location_images/";
  const imageUrl = baseUrl + image.imageurl + ".png";
  const [dialogOpen, setDialogOpen] = useState(false);
  const [disableDelete, setDisableDelete] = useState(false);
  const [disableEdit, setDisableEdit] = useState(false);

  const deleteImage = (id) => {
    setDisableDelete(true);
    setDisableEdit(true);
    handleDelete(image).then((res) => {
      setTimeout(() => {
        setDisableDelete(false);
        setDisableEdit(false);
      }, 2000);
    });
  };

  return (
    <Card
      sx={{
        minWidth: 300,
        margin: "auto",
      }}
    >
      <DeleteAlert
        title="Vil du slette billedet?"
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteImage}
      />
      <CardMedia
        image={imageUrl}
        sx={{
          height: 640,
          width: "100%",
          objectFit: "cover",
        }}
      />
      <CardContent>
        <Typography
          variant="body2"
          color="textSecondary"
          align="right"
          component="p"
        >
          {moment(image.date).format("YYYY-MM-DD HH:mm")}
        </Typography>
        <Typography variant="body2" color="textSecondary" component="p">
          {image.comment}
        </Typography>
      </CardContent>
      <CardActions>
        <Button
          disabled={disableDelete}
          onClick={() => setDialogOpen(true)}
          size="small"
          color="primary"
        >
          {disableDelete ? <CircularProgress /> : "Slet"}
        </Button>
        <Button
          disabled={disableEdit}
          onClick={() => handleEdit(image)}
          size="small"
          color="primary"
        >
          Rediger
        </Button>
      </CardActions>
    </Card>
  );
}

export default ImageCard;
