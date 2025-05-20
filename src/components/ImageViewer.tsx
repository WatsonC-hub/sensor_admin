import {Grid2} from '@mui/material';
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
    <Grid2 container spacing={2} mx="auto">
      {images?.map((elem, index) => {
        return (
          <Grid2
            size={{
              mobile: 12,
              laptop: 6,
            }}
            key={elem.gid}
            display={'flex'}
            justifyContent={isTouch ? 'center' : index % 2 === 0 ? 'end' : 'start'}
          >
            <ImageCard image={elem} deleteMutation={deleteMutation} handleEdit={handleEdit} />
          </Grid2>
        );
      })}
    </Grid2>
  );
}

export default ImageViewer;
