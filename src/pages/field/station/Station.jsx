import {AddAPhotoRounded} from '@mui/icons-material';
import {Alert, Box, Divider, Typography} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import {StationPages} from '~/helpers/EnumHelper';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';
import ActionArea from '~/pages/field/station/ActionArea';
import BearingGraph from '~/pages/field/station/BearingGraph';
import EditStamdata from '~/pages/field/station/EditStamdata';
import Pejling from '~/pages/field/station/pejling/Pejling';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {stamdataStore} from '~/state/store';

export default function Station({ts_id, stamdata, tempData}) {
  let params = useParams();
  const [showForm, setShowForm] = useSearchParam('showForm');
  const [pageToShow, setPageToShow] = useSearchParam('page', null);
  const [dynamic, setDynamic] = useState([]);
  const [canEdit] = useState(true);
  const fileInputRef = useRef(null);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);
  const {createStamdata} = useNavigationFunctions();
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: params.locid,
    comment: '',
    public: false,
    date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
  });
  const store = stamdataStore();
  useEffect(() => {
    if (stamdata) {
      store.setLocation(stamdata);
      store.setTimeseries(stamdata);
      store.setUnit(stamdata);
    }
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, [stamdata]);
  const isCalculated = stamdata ? stamdata?.calculated : false;

  const changeActiveImageData = (field, value) => {
    setActiveImage({
      ...activeImage,
      [field]: value,
    });
  };

  const convertBase64 = (file) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    });
  };

  const handleSetDataURI = (datauri) => {
    setdataUri(datauri);
    setActiveImage({
      gid: -1,
      type: params.locid,
      comment: '',
      public: false,
      date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
    });
    setOpenSave(true);
  };

  const handleFileRead = async (event) => {
    setShowForm('true');
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    handleSetDataURI(base64);
  };

  const handleFileInputClick = () => {
    if (openSave !== true) fileInputRef.current.value = null;
  };

  useEffect(() => {
    setPageToShow(pageToShow);
    if (stamdata?.calculated && pageToShow == StationPages.TILSYN)
      setPageToShow(StationPages.PEJLING);

    if (showForm === null) setDynamic([]);
  }, [ts_id, showForm]);

  return (
    <Box
      display="flex"
      height={
        ts_id === -1 && stamdata && pageToShow === StationPages.PEJLING ? '95vh' : 'max-content'
      }
      flexDirection={'column'}
    >
      {((!stamdata && ts_id === -1) || ts_id !== -1) && (
        <>
          {pageToShow !== StationPages.BILLEDER && pageToShow !== StationPages.STAMDATA && (
            <Box sx={{marginBottom: 1, marginTop: 1}}>
              <BearingGraph
                stationId={ts_id}
                dynamicMeasurement={
                  pageToShow === StationPages.PEJLING && showForm === 'true' ? dynamic : undefined
                }
              />
              <Divider />
            </Box>
          )}
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              maxWidth: '1080px',
              alignSelf: 'center',
            }}
          >
            {pageToShow === StationPages.PEJLING && ts_id !== -1 && (
              <Pejling ts_id={ts_id} setDynamic={setDynamic} />
            )}
            {pageToShow === StationPages.TILSYN && <Tilsyn ts_id={ts_id} canEdit={canEdit} />}
          </Box>
        </>
      )}

      {ts_id === -1 && stamdata && pageToShow === StationPages.PEJLING && (
        <Box
          display={'flex'}
          alignSelf={'center'}
          flexDirection={'column'}
          margin={'auto'}
          maxWidth={400}
          gap={2}
        >
          <Alert
            severity={'info'}
            sx={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
            }}
          >
            <Typography>
              Der er ingen tidsserie og/eller udstyr tilknyttet denne lokation. Tryk på knappen
              nedenfor for at påbegynde oprettelse af tidsserie og/eller tilknytning af udstyr
            </Typography>
          </Alert>
          <Button
            bttype="primary"
            onClick={() => {
              createStamdata(ts_id !== -1 ? '2' : '1');
            }}
          >
            Opret tidsserie og/eller udstyr
          </Button>
        </Box>
      )}

      {pageToShow === StationPages.STAMDATA && (
        <EditStamdata ts_id={ts_id} metadata={stamdata} canEdit={canEdit} tempData={tempData} />
      )}
      {pageToShow === StationPages.BILLEDER && (
        <Box>
          <FabWrapper
            icon={<AddAPhotoRounded />}
            text={'Tilføj ' + StationPages.BILLEDER}
            onClick={() => {
              fileInputRef.current.click();
            }}
          >
            <Images
              type={'station'}
              typeId={params.locid}
              setOpenSave={setOpenSave}
              setActiveImage={setActiveImage}
              setShowForm={setShowForm}
            />
          </FabWrapper>
          <SaveImageDialog
            activeImage={activeImage}
            changeData={changeActiveImageData}
            id={params.locid}
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
      {(tempData || stamdata) && (
        <ActionArea
          isCalculated={isCalculated}
          ts_id={ts_id}
          stamdata={stamdata}
          tempData={tempData}
        />
      )}
    </Box>
  );
}
