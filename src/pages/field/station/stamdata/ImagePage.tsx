import {AddAPhotoRounded} from '@mui/icons-material';
import dayjs from 'dayjs';
import React, {ChangeEvent, createRef, useState} from 'react';

import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import usePermissions from '~/features/permissions/api/usePermissions';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';

const ImagePage = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const fileInputRef = createRef<HTMLInputElement>();
  const [, setShowForm] = useShowFormState();
  const [dataUri, setdataUri] = useState<string | ArrayBuffer | null>('');
  const [openSave, setOpenSave] = useState(false);
  const {location_permissions} = usePermissions(loc_id);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: loc_id?.toString(),
    comment: '',
    public: false,
    date: dayjs(),
  });

  const changeActiveImageData = (field: string, value: string) => {
    setActiveImage({...activeImage, [field]: value});
  };

  const handleSetDataURI = (datauri: string | ArrayBuffer | null) => {
    setdataUri(datauri);
    setActiveImage({
      gid: -1,
      type: loc_id?.toString(),
      comment: '',
      public: false,
      date: dayjs(),
    });
    setOpenSave(true);
  };

  const convertBase64 = (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    }) as Promise<string | ArrayBuffer | null>;
  };

  const handleFileRead = async (event: ChangeEvent<HTMLInputElement>) => {
    setShowForm(true);
    if (event && event.target.files) {
      const file = event.target.files[0];
      const base64 = await convertBase64(file);
      handleSetDataURI(base64);
    }
  };

  return (
    <>
      <StationPageBoxLayout>
        <Images
          type={'station'}
          typeId={loc_id ?? ''}
          setOpenSave={setOpenSave}
          setActiveImage={setActiveImage}
          setShowForm={setShowForm}
        />
      </StationPageBoxLayout>
      <FabWrapper
        icon={<AddAPhotoRounded />}
        text={'Tilføj billeder'}
        disabled={location_permissions !== 'edit'}
        onClick={() => {
          if (fileInputRef.current) {
            fileInputRef.current.click();
            fileInputRef.current.value = '';
          }
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
          setdataUri(null);
          setShowForm(null);
        }}
      />
      <input
        type="file"
        accept="image/*"
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileRead}
      />
    </>
  );
};

export default ImagePage;
