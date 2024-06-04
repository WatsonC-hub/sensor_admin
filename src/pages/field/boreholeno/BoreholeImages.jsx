import {Box, Grid} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';

import {apiClient} from '~/apiClient';
import ImageViewer from '~/components/ImageViewer';
import {useImageUpload} from '~/hooks/query/useImageUpload';

function BoreholeImages(props) {
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
