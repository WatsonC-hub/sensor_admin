import React from "react";
import ImageCard from "./ImageCard";

import { Grid } from "@material-ui/core";

function ImageViewer({ images, handleDelete, handleEdit }) {
  return (
    <Grid container spacing={3}>
      {images.map((elem) => {
        return (
          <Grid item xs={10} sm={6} md={6} lg={4}>
            <ImageCard
              image={elem}
              handleDelete={handleDelete}
              handleEdit={handleEdit}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default ImageViewer;
