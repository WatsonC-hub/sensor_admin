import ImageViewer from '~/components/ImageViewer';
import useImages from '~/features/station/api/useImages';
import {useImageUpload} from '~/hooks/query/useImageUpload';
import {Image} from '~/types';

interface Props {
  type: 'station' | 'borehole';
  typeId: string | number;
  setOpenSave: (openSave: boolean) => void;
  setActiveImage: (image: Image) => void;
  setShowForm: (showForm: boolean) => void;
}

function Images({type, typeId, setOpenSave, setActiveImage, setShowForm}: Props) {
  const {
    get: {data: images, error},
  } = useImages(typeId, type);

  const {del: deleteImage} = useImageUpload(type, typeId);

  if (error) {
    return;
  }

  const handleEdit = (image: Image) => {
    setActiveImage(image);
    setOpenSave(true);
    setShowForm(true);
  };

  return (
    <ImageViewer
      deleteMutation={deleteImage}
      handleEdit={handleEdit}
      images={images}
      type={type}
      id={typeId}
    />
  );
}

export default Images;
