import {Box, CircularProgress, Grid2, Skeleton, Typography} from '@mui/material';
import {MutationState, useMutationState} from '@tanstack/react-query';
import React, {useEffect} from 'react';

import ImageCard from '~/components/ImageCard';
import {Image} from '~/types';
import Button from './Button';
import {ImagePayload} from '~/hooks/query/useImageUpload';

type ImageViewerProps = {
  images: Array<Image>;
  deleteMutation: any;
  handleEdit: any;
  type: string | number;
  id: string | number;
};

function downloadDataUri(dataUri: string, filename: string) {
  // Convert base64/URLEncoded data component to raw binary data held in a string
  const byteString = atob(dataUri.split(',')[1]);
  const mimeString = dataUri.split(',')[0].split(':')[1].split(';')[0];
  const imageFormat = mimeString.split('/')[1];

  // Write the bytes of the string to an ArrayBuffer
  const ab = new ArrayBuffer(byteString.length);
  const ia = new Uint8Array(ab);
  for (let i = 0; i < byteString.length; i++) {
    ia[i] = byteString.charCodeAt(i);
  }

  const blob = new Blob([ab], {type: mimeString});
  const url = URL.createObjectURL(blob);

  // --- Desktop browsers (Chrome, Edge, Firefox, etc.) ---
  const link = document.createElement('a');
  link.href = url;
  link.download = `${filename.replace(/\.[^/.]+$/, '')}.${imageFormat}`;
  document.body.appendChild(link);

  // Safari (iOS) ignores .click() on hidden links unless in user gesture

  link.click();

  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}

function ImageViewer({images, deleteMutation, handleEdit, type, id}: ImageViewerProps) {
  const [columns, setColumns] = React.useState(6);
  const [size, setSize] = React.useState(480);
  const [mobileRatio, setMobileRatio] = React.useState(false);

  const image_cache = useMutationState<MutationState<unknown, unknown, ImagePayload>>({
    filters: {exact: true, mutationKey: ['image_post', type, id]},
  }).filter((m) => m.status === 'error' || m.status === 'pending');

  useEffect(() => {
    const resizeObserver = new ResizeObserver((event) => {
      const width = event[0].contentRect.width;
      const mobileRatio = width < 800;
      const size = mobileRatio ? 300 : 480;
      setSize(size);
      setMobileRatio(mobileRatio);
      if (!mobileRatio && images && images.length > 2) {
        const calculatedColumns = Math.floor(12 / Math.floor(width / size));
        setColumns(calculatedColumns);
      }
    });
    const main_content = document.getElementById('main_content');
    if (resizeObserver && main_content !== null) resizeObserver.observe(main_content);

    return () => resizeObserver.disconnect();
  }, [images]);

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
            size={mobileRatio ? 12 : columns}
            display={'flex'}
            justifyContent={'center'}
          >
            <Box
              display={'flex'}
              sx={{
                position: 'relative',
                width: size,
                height: size,
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
                <Button
                  bttype="primary"
                  onClick={async () => {
                    try {
                      downloadDataUri(m.variables?.data.uri as string, 'image');
                    } catch (err) {
                      console.error('Failed to download image:', err);
                    }
                  }}
                >
                  Gem billede lokalt
                </Button>
              </Box>
            </Box>
          </Grid2>
        ))}

        {images?.map((elem) => (
          <Grid2
            key={elem.gid}
            display={'flex'}
            flexWrap={'wrap'}
            size={mobileRatio || images.length + image_cache.length === 1 ? 12 : columns}
            justifyContent={'center'}
          >
            <ImageCard
              image={elem}
              deleteMutation={deleteMutation}
              handleEdit={handleEdit}
              mobileSize={size}
            />
          </Grid2>
        ))}
      </Grid2>
    </Box>
  );
}

export default ImageViewer;
