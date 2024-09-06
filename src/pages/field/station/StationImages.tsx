import {Box, Grid} from '@mui/material';
import {useQuery} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import ImageViewer from '~/components/ImageViewer';
import {useImageUpload} from '~/hooks/query/useImageUpload';
import {Image} from '~/types';

interface StationImagesProps {
  locationId: number;
  setActiveImage: (image: Image) => void;
  setOpenSave: (open: boolean) => void;
  setShowForm: (form: string) => void;
}

function StationImages({locationId, setActiveImage, setOpenSave, setShowForm}: StationImagesProps) {
  const {data: images} = useQuery({
    queryKey: ['images', locationId],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/images/${locationId}`);
      return data;
    },
  });

  const {del: deleteImage} = useImageUpload('station');

  const handleEdit = (image: Image) => {
    setActiveImage(image);
    setOpenSave(true);
    setShowForm('true');
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
