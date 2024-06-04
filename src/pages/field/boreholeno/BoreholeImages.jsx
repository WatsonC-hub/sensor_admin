import {PhotoCameraRounded} from '@mui/icons-material';
import {Box, Button, Grid} from '@mui/material';
import {useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import ImageViewer from '~/components/ImageViewer';
import {useImageUpload} from '~/hooks/query/useImageUpload';

import ImageViewerBorehole from './components/ImageViewerBorehole';
import SaveImageDialogBorehole from './components/SaveImageDialogBorehole';

function BoreholeImages(props) {
  const queryClient = useQueryClient();

  const {data: images} = useQuery({
    queryKey: ['images', props.boreholeno],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/borehole/image/${props.boreholeno}`);
      return data;
    },
  });

  const {del: deleteImage} = useImageUpload('borehole');

  const handleEdit = (image) => {
    props.setActiveImage(image);
    props.setOpenSave(true);
    props.setShowForm(true);
  };

  return (
    <Box sx={{marginBottom: 1, marginTop: 1}}>
      <Grid container spacing={3} justifyContent={'center'}>
        <Grid item xs={12} sm={12}>
          <ImageViewer deleteMutation={deleteImage} handleEdit={handleEdit} images={images} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default BoreholeImages;
