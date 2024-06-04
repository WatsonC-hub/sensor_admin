import {Box, Grid} from '@mui/material';
import {useQuery, useQueryClient} from '@tanstack/react-query';

import {apiClient} from '~/apiClient';
import ImageViewer from '~/components/ImageViewer';
import {useImageUpload} from '~/hooks/query/useImageUpload';
import {Image} from '~/types';

interface Props {
  type: string;
  typeId: string;
  setOpenSave: (openSave: boolean) => void;
  setActiveImage: (image: Image) => void;
  setShowForm: (showForm: boolean) => void;
}

function Images({type, typeId, setOpenSave, setActiveImage, setShowForm}: Props) {
  const imageType: string = type === 'borehole' ? 'image' : 'images';
  const {data: images} = useQuery({
    queryKey: ['images', typeId], //() => getImage(props.locationId));
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/${type}/${imageType}/${typeId}`);
      return data;
    },
  });

  const {del: deleteImage} = useImageUpload('station');

  const handleEdit = (image: Image) => {
    setActiveImage(image);
    setOpenSave(true);
    setShowForm(true);
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

export default Images;
