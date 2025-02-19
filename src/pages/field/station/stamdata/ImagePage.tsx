import {AddAPhotoRounded} from '@mui/icons-material';
import {Box} from '@mui/material';
import moment from 'moment';
import React, {createRef, useState} from 'react';

import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

const ImagePage = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const fileInputRef = createRef<HTMLInputElement>();
  const [, setShowForm] = useShowFormState();
  const [dataUri, setdataUri] = useState<string | ArrayBuffer | null>('');
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: loc_id?.toString(),
    comment: '',
    public: false,
    date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
  });

  const changeActiveImageData = (field: string, value: string) => {
    setActiveImage({...activeImage, [field]: value});
  };
  return (
    <Box>
      <Images
        type={'station'}
        typeId={loc_id ? loc_id.toString() : ''}
        setOpenSave={setOpenSave}
        setActiveImage={setActiveImage}
        setShowForm={setShowForm}
      />
      <FabWrapper
        icon={<AddAPhotoRounded />}
        text={'Tilføj billeder'}
        onClick={() => {
          if (fileInputRef.current) fileInputRef.current.click();
        }}
      />
      <SaveImageDialog
        activeImage={activeImage}
        changeData={changeActiveImageData}
        id={loc_id ?? ''}
        type={'station'}
        open={openSave}
        dataUri={dataUri}
        handleCloseSave={() => {
          setOpenSave(false);
          setdataUri('');
          setShowForm(null);
        }}
      />
    </Box>
  );
};

export default ImagePage;
