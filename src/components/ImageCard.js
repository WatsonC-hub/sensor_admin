import React, { useState } from "react";
import { makeStyles } from "@material-ui/core/styles";
import Card from "@material-ui/core/Card";
import CardActionArea from "@material-ui/core/CardActionArea";
import CardActions from "@material-ui/core/CardActions";
import CardContent from "@material-ui/core/CardContent";
import CardMedia from "@material-ui/core/CardMedia";
import Button from "@material-ui/core/Button";
import Typography from "@material-ui/core/Typography";
import DeleteAlert from "../pages/station/DeleteAlert";
import CircularProgress from "@material-ui/core/CircularProgress";
import moment from "moment";

const useStyles = makeStyles({
  root: {
    // minWidth: 300,
  },
  media: {
    minHeight: 300,
    // minWidth: 300,
  },
});

function ImageCard({ image, handleDelete, handleEdit }) {
  const baseUrl =
    "https://calypsoimages.s3.eu-north-1.amazonaws.com/location_images/";
  const imageUrl = baseUrl + image.imageurl + ".png";
  const classes = useStyles();
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
    <Card className={classes.root}>
      <DeleteAlert
        title="Vil du slette billedet?"
        dialogOpen={dialogOpen}
        setDialogOpen={setDialogOpen}
        onOkDelete={deleteImage}
      />
      <CardActionArea>
        <CardMedia className={classes.media} image={imageUrl} />
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
      </CardActionArea>
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
