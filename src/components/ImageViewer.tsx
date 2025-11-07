import {Box, CircularProgress, Grid2, Skeleton, Typography} from '@mui/material';
import {useMutationState} from '@tanstack/react-query';
import React from 'react';

import ImageCard from '~/components/ImageCard';
import useBreakpoints from '~/hooks/useBreakpoints';
import {Image} from '~/types';

type ImageViewerProps = {
  images: Array<Image>;
  deleteMutation: any;
  handleEdit: any;
  type: string | number;
  id: string | number;
};

function ImageViewer({images, deleteMutation, handleEdit, type, id}: ImageViewerProps) {
  const {isTouch, isMobile} = useBreakpoints();
  const image_cache = useMutationState({
    filters: {exact: true, mutationKey: ['image_post', type, id]},
  }).filter((m) => m.status === 'error' || m.status === 'pending');

  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Grid2 container spacing={2}>
        {image_cache.map((m, index) => (
          <Grid2
            key={`pending-${index}`}
            size={isTouch ? 12 : 6}
            display={'flex'}
            justifyContent={isTouch ? 'center' : index % 2 === 0 ? 'end' : 'start'}
          >
            <Box
              display={'flex'}
              sx={{
                position: 'relative',
                width: isMobile ? '300px' : '480px',
                height: isMobile ? '300px' : '480px',
                borderRadius: 2,
              }}
            >
              <Skeleton
                variant="rectangular"
                sx={{
                  position: 'relative',
                  width: '100%',
                  height: '100%',
                  borderRadius: 2,
                  zIndex: 1,
                }}
              />
              <Box
                sx={{
                  position: 'absolute',
                  top: '50%',
                  left: '50%',
                  transform: 'translate(-50%, -50%)',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  alignContent: 'center',
                  gap: 1,
                  zIndex: 2,
                }}
              >
                <CircularProgress size={48} thickness={4} sx={{color: 'primary.main'}} />
                {m.isPaused && (
                  <Typography
                    variant="body2"
                    sx={{color: 'primary.main', width: 300, mx: 'auto'}}
                    textAlign={'center'}
                  >
                    Upload afventer at blive genoptaget...
                  </Typography>
                )}
              </Box>
            </Box>
          </Grid2>
        ))}

        {images?.map((elem, index) => (
          <Grid2
            key={elem.gid}
            display={'flex'}
            size={isTouch ? 12 : 6}
            justifyContent={
              isTouch ? 'center' : (index + image_cache.length) % 2 === 0 ? 'end' : 'start'
            }
          >
            <ImageCard image={elem} deleteMutation={deleteMutation} handleEdit={handleEdit} />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}

export default ImageViewer;
