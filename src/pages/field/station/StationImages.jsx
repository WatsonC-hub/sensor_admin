import {Box, Grid} from '@mui/material';
import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import ImageViewer from '~/components/ImageViewer';
import {useImageUpload} from '~/hooks/query/useImageUpload';

function StationImages(props) {
  const {data: images} = useQuery({
    queryKey: ['images', props.locationId], //() => getImage(props.locationId));
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/images/${props.locationId}`);
      return data;
    },
  });

  const {del: deleteImage} = useImageUpload('station');

  const handleEdit = (image) => {
    props.setActiveImage(image);
    props.setOpenSave(true);
    props.setShowForm(true);
  };

  return (
    <Box sx={{marginBottom: 1, marginTop: 1}}>
      <Grid container spacing={3} justifyContent="center">
        <Grid item xs={12} sm={12}>
          <ImageViewer deleteMutation={deleteImage} handleEdit={handleEdit} images={images} />
        </Grid>
      </Grid>
    </Box>
  );
}

export default StationImages;
