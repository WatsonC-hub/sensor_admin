import {Grid} from '@mui/material';
import React from 'react';

import ImageCardBorehole from './ImageCardBorehole';

function ImageViewerBorehole({images, deleteMutation, handleEdit}) {
  return (
    <Grid container spacing={3} alignItems="center" justifyContent="center">
      {images?.map((elem) => {
        return (
          <Grid item xs={10} sm={6} md={6} lg={5} key={elem.gid}>
            <ImageCardBorehole
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

export default ImageViewerBorehole;
