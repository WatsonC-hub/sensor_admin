import {AddAPhotoRounded} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import moment from 'moment';
import React, {ChangeEvent, createRef, ReactNode, useEffect, useState} from 'react';

import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import ActionArea from '~/features/station/components/ActionArea';
import PlotGraph from '~/features/station/components/StationGraph';
import {stationPages} from '~/helpers/EnumHelper';
import {TimeseriesMetadata, useMetadata} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import Pejling from '~/pages/field/station/pejling/Pejling';
import EditStamdata from '~/pages/field/station/stamdata/EditStamdata';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {useAppContext} from '~/state/contexts';

export default function Station() {
  const {loc_id, ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const {metadata} = useMetadata();
  const [showForm, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const [dynamic, setDynamic] = useState<Array<string | number> | undefined>();
  const fileInputRef = createRef<HTMLInputElement>();
  const [dataUri, setdataUri] = useState<string | ArrayBuffer | null>('');
  const [openSave, setOpenSave] = useState(false);
  const {isTouch} = useBreakpoints();
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

  const handleSetDataURI = (datauri: string | ArrayBuffer | null) => {
    setdataUri(datauri);
    setActiveImage({
      gid: -1,
      type: loc_id?.toString(),
      comment: '',
      public: false,
      date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
    });
    setOpenSave(true);
  };

  const handleFileRead = async (event: ChangeEvent<HTMLInputElement>) => {
    setShowForm(true);
    if (event && event.target.files) {
      const file = event.target.files[0];
      const base64 = await convertBase64(file);
      handleSetDataURI(base64);
    }
  };

  const handleFileInputClick = () => {
    if (openSave !== true && fileInputRef.current && 'value' in fileInputRef.current)
      fileInputRef.current.value = '';
  };

  useEffect(() => {
    setPageToShow(pageToShow);
    if ((metadata as TimeseriesMetadata)?.calculated && pageToShow == 'tilsyn')
      setPageToShow('pejling');

    if (showForm === null) setDynamic([]);
  }, [ts_id, showForm]);

  return (
    <Layout>
      {pageToShow !== 'billeder' && pageToShow !== 'stamdata' && (
        <PlotGraph
          key={ts_id}
          dynamicMeasurement={
            pageToShow === stationPages.PEJLING && showForm === true ? dynamic : undefined
          }
        />
      )}
      <Divider />
      <Box
        sx={{
          maxWidth: '1080px',
          width: isTouch ? '100%' : 'fit-content',
          alignSelf: 'center',
        }}
      >
        {pageToShow === 'pejling' && ts_id !== -1 && <Pejling setDynamic={setDynamic} />}
        {pageToShow === 'tilsyn' && <Tilsyn />}
      </Box>
      {pageToShow === 'stamdata' && <EditStamdata />}
      {pageToShow === 'billeder' && (
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
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileRead}
        onClick={handleFileInputClick}
      />
    </Layout>
  );
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  return (
    <Box display="flex" flexDirection={'column'} gap={1}>
      {children}
      <ActionArea />
    </Box>
  );
};
