import {Grid} from '@mui/material';
import React from 'react';

import ImageCard from '~/components/ImageCard';
import {Image} from '~/types';

type ImageViewerProps = {
  images: Array<Image>;
  deleteMutation: any;
  handleEdit: any;
};

function ImageViewer({images, deleteMutation, handleEdit}: ImageViewerProps) {
  console.log(images);
  return (
    <Grid container spacing={3} alignItems="center" justifyContent="center">
      {images?.map((elem) => {
        return (
          <Grid item xs={10} sm={6} md={6} lg={5} key={elem.gid}>
            <ImageCard image={elem} deleteMutation={deleteMutation} handleEdit={handleEdit} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default ImageViewer;
