import React from "react";
import ImageCard from "./ImageCard";

import { Grid } from "@mui/material";

function ImageViewer({ images, deleteMutation, handleEdit }) {
  return (
    <Grid container spacing={3}>
      {images?.map((elem) => {
        return (
          <Grid item xs={10} sm={6} md={6} lg={4} key={elem.gid}>
            <ImageCard
              image={elem}
              deleteMutation={deleteMutation}
              handleEdit={handleEdit}
            />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default ImageViewer;
