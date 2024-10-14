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
  return (
    <Grid container spacing={3}>
      {images?.map((elem) => {
        return (
          <Grid item mobile={12} tablet={12} laptop={6} desktop={6} xl={6} key={elem.gid}>
            <ImageCard image={elem} deleteMutation={deleteMutation} handleEdit={handleEdit} />
          </Grid>
        );
      })}
    </Grid>
  );
}

export default ImageViewer;
