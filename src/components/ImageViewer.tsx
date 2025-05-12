import {Grid} from '@mui/material';
import React from 'react';

import ImageCard from '~/components/ImageCard';
import useBreakpoints from '~/hooks/useBreakpoints';
import {Image} from '~/types';

type ImageViewerProps = {
  images: Array<Image>;
  deleteMutation: any;
  handleEdit: any;
};

function ImageViewer({images, deleteMutation, handleEdit}: ImageViewerProps) {
  const {isTouch} = useBreakpoints();
  return (
    <>
      {images?.map((elem, index) => {
        return (
          <Grid
            item
            mobile={12}
            tablet={12}
            laptop={6}
            desktop={6}
            xl={6}
            key={elem.gid}
            display={'flex'}
            justifyContent={isTouch ? 'center' : index % 2 === 0 ? 'end' : 'start'}
          >
            <ImageCard image={elem} deleteMutation={deleteMutation} handleEdit={handleEdit} />
          </Grid>
        );
      })}
    </>
  );
}

export default ImageViewer;
