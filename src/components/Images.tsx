import ImageViewer from '~/components/ImageViewer';
import useImages from '~/features/station/api/useImages';
import {useImageUpload} from '~/hooks/query/useImageUpload';
import {Image} from '~/types';

interface Props {
  type: string;
  typeId: string | number;
  setOpenSave: (openSave: boolean) => void;
  setActiveImage: (image: Image) => void;
  setShowForm: (showForm: boolean) => void;
}

function Images({type, typeId, setOpenSave, setActiveImage, setShowForm}: Props) {
  const imageType: string = type === 'borehole' ? 'image' : 'images';
  const {
    get: {data: images, error},
  } = useImages(typeId, imageType, type);

  const endpoint = type === 'borehole' ? 'borehole' : 'station';
  const {del: deleteImage} = useImageUpload(endpoint);

  if (error) {
    return;
  }

  const handleEdit = (image: Image) => {
    setActiveImage(image);
    setOpenSave(true);
    setShowForm(true);
  };

  return <ImageViewer deleteMutation={deleteImage} handleEdit={handleEdit} images={images} />;
}

export default Images;
