import {Box, CircularProgress, Grid2, Skeleton, Typography} from '@mui/material';
import {Mutation, useMutationState, useQueryClient} from '@tanstack/react-query';
import React, {useEffect} from 'react';

import ImageCard from '~/components/ImageCard';
import {Image} from '~/types';
import Button from './Button';
import {ImagePayload, useImageUpload} from '~/hooks/query/useImageUpload';
import {APIError} from '~/queryClient';

type ImageViewerProps = {
  images: Array<Image> | undefined;
  deleteMutation: any;
  handleEdit: any;
  type: 'station' | 'borehole';
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
  useMutationState({filters: {exact: true, mutationKey: ['image_post', type, id]}});

  const queryClient = useQueryClient();

  const mutationCache = queryClient.getMutationCache();
  const mutations = mutationCache
    .findAll({exact: true, mutationKey: ['image_post', type, id]})
    .filter((m) => m.state.status === 'error' || m.state.status === 'pending') as Mutation<
    unknown,
    APIError,
    ImagePayload
  >[];

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

  const {post} = useImageUpload(type, id);
  return (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'center',
      }}
    >
      <Grid2 container spacing={2}>
        {mutations.map((m) => {
          return (
            <Grid2
              key={m.mutationId}
              size={mobileRatio || (images || []).length + mutations.length === 1 ? 12 : columns}
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
                  {!m.state.error && (
                    <CircularProgress size={48} thickness={4} sx={{color: 'primary.main'}} />
                  )}
                  <Typography
                    variant="body2"
                    sx={{color: 'primary.main', width: 300, mx: 'auto'}}
                    textAlign={'center'}
                  >
                    {m.state.status === 'error'
                      ? 'Upload fejlede...'
                      : m.state.isPaused
                        ? 'Afventer at blive genoptaget...'
                        : 'Uploader...'}
                  </Typography>
                  <Button
                    bttype="primary"
                    onClick={async () => {
                      try {
                        downloadDataUri(m.state.variables?.data.uri as string, 'image');
                        mutationCache.remove(m);
                      } catch (err) {
                        console.error('Failed to download image:', err);
                      }
                    }}
                  >
                    Gem billede lokalt
                  </Button>
                  <Button
                    bttype="tertiary"
                    onClick={() => {
                      mutationCache.remove(m);
                      post.mutate(m.state.variables as ImagePayload);
                    }}
                  >
                    Genupload
                  </Button>
                </Box>
              </Box>
            </Grid2>
          );
        })}

        {images?.map((elem) => (
          <Grid2
            key={elem.gid}
            display={'flex'}
            flexWrap={'wrap'}
            size={mobileRatio || images.length + mutations.length === 1 ? 12 : columns}
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
