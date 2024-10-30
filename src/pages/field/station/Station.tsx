import {AddAPhotoRounded} from '@mui/icons-material';
import {Alert, Box, Divider, Typography} from '@mui/material';
import moment from 'moment';
import React, {ChangeEvent, createRef, ReactNode, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import ActionArea from '~/features/station/components/ActionArea';
import PlotGraph from '~/features/station/components/StationGraph';
import {StationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useSearchParam} from '~/hooks/useSeachParam';
import Pejling from '~/pages/field/station/pejling/Pejling';
import EditStamdata from '~/pages/field/station/stamdata/EditStamdata';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {stamdataStore} from '~/state/store';

interface StationProps {
  ts_id: number;
  stamdata: any;
}

export default function Station({ts_id, stamdata}: StationProps) {
  const params = useParams();
  const [showForm, setShowForm] = useSearchParam('showForm');
  const [pageToShow, setPageToShow] = useSearchParam('page', null);
  const [dynamic, setDynamic] = useState<Array<string | number> | undefined>();
  const [canEdit] = useState(true);
  const fileInputRef = createRef<HTMLInputElement>();
  const [dataUri, setdataUri] = useState<string | ArrayBuffer | null>('');
  const [openSave, setOpenSave] = useState(false);
  const {createStamdata} = useNavigationFunctions();
  const {isTouch} = useBreakpoints();
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

  const changeActiveImageData = (field: string, value: string) => {
    setActiveImage({
      ...activeImage,
      [field]: value,
    });
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
      type: params.locid,
      comment: '',
      public: false,
      date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
    });
    setOpenSave(true);
  };

  const handleFileRead = async (event: ChangeEvent<HTMLInputElement>) => {
    setShowForm('true');
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
    if (stamdata?.calculated && pageToShow == StationPages.TILSYN)
      setPageToShow(StationPages.PEJLING);

    if (showForm === null) setDynamic([]);
  }, [ts_id, showForm]);

  if (ts_id === -1 && pageToShow === StationPages.PEJLING) {
    return (
      <Layout dynamic={dynamic} stamdata={stamdata} ts_id={ts_id}>
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
      </Layout>
    );
  }

  return (
    <Layout dynamic={dynamic} stamdata={stamdata} ts_id={ts_id}>
      <Box
        sx={{
          maxWidth: '1080px',
          width: isTouch ? '100%' : 'fit-content',
          alignSelf: 'center',
        }}
      >
        {pageToShow === StationPages.PEJLING && ts_id !== -1 && (
          <Pejling ts_id={ts_id} setDynamic={setDynamic} />
        )}
        {pageToShow === StationPages.TILSYN && <Tilsyn ts_id={ts_id} canEdit={canEdit} />}
      </Box>
      {pageToShow === StationPages.STAMDATA && (
        <EditStamdata ts_id={ts_id} metadata={stamdata} canEdit={canEdit} />
      )}
      {pageToShow === StationPages.BILLEDER && (
        <Box>
          <Images
            type={'station'}
            typeId={params.locid ?? ''}
            setOpenSave={setOpenSave}
            setActiveImage={setActiveImage}
            setShowForm={setShowForm}
          />
          <FabWrapper
            icon={<AddAPhotoRounded />}
            text={'Tilføj ' + StationPages.BILLEDER}
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
          />
          <SaveImageDialog
            activeImage={activeImage}
            changeData={changeActiveImageData}
            id={params.locid ?? ''}
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
  ts_id: number;
  stamdata: any;
  dynamic: Array<string | number> | undefined;
}

const Layout = ({children, ts_id, stamdata, dynamic}: LayoutProps) => {
  const [pageToShow] = useSearchParam('page', null);
  const [showForm] = useSearchParam('showForm');
  const isCalculated = stamdata ? stamdata?.calculated : false;

  return (
    <Box
      display="flex"
      height={ts_id === -1 && pageToShow === StationPages.PEJLING ? '95vh' : 'max-content'}
      flexDirection={'column'}
    >
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{marginBottom: 0.5, marginTop: 0.2}}
      >
        {pageToShow !== StationPages.BILLEDER && pageToShow !== StationPages.STAMDATA && (
          <Box
            display={'flex'}
            flexDirection={'column'}
            gap={5}
            sx={{marginBottom: 0.5, marginTop: 0.2}}
          >
            <PlotGraph
              ts_id={ts_id}
              dynamicMeasurement={
                pageToShow === StationPages.PEJLING && showForm === 'true' ? dynamic : undefined
              }
            />
            <Divider />
          </Box>
        )}
        {children}
      </Box>
      <ActionArea isCalculated={isCalculated} ts_id={ts_id} />
    </Box>
  );
};
