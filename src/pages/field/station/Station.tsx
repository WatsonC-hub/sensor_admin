import {AddAPhotoRounded} from '@mui/icons-material';
import {Alert, Box, Divider, Typography} from '@mui/material';
import moment from 'moment';
import {parseAsBoolean, useQueryState} from 'nuqs';
import React, {ChangeEvent, createRef, ReactNode, useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import Button from '~/components/Button';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import ActionArea from '~/features/station/components/ActionArea';
import PlotGraph from '~/features/station/components/StationGraph';
import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useStationPages} from '~/hooks/useStationPages';
import Pejling from '~/pages/field/station/pejling/Pejling';
import EditStamdata from '~/pages/field/station/stamdata/EditStamdata';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {useStamdataStore} from '~/state/store';

interface StationProps {
  ts_id: number;
  stamdata: any;
}

export default function Station({ts_id, stamdata}: StationProps) {
  const params = useParams();
  const [showForm, setShowForm] = useQueryState('showForm', parseAsBoolean);
  const [pageToShow, setPageToShow] = useStationPages();
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
  const store = useStamdataStore((state) => state);

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
      type: params.locid,
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
    if (stamdata?.calculated && pageToShow == 'tilsyn') setPageToShow('pejling');

    if (showForm === null) setDynamic([]);
  }, [ts_id, showForm]);

  if (ts_id === -1 && stamdata && pageToShow === 'pejling') {
    return (
      <Layout stamdata={stamdata} ts_id={ts_id}>
        <Box
          display={'flex'}
          alignSelf={'center'}
          flexDirection={'column'}
          marginX={'auto'}
          maxWidth={400}
          gap={2}
          marginY={4}
        >
          <Alert
            severity={'info'}
            sx={{display: 'flex', justifyContent: 'center', alignItems: 'center'}}
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
    <Layout stamdata={stamdata} ts_id={ts_id}>
      {pageToShow !== 'billeder' && stamdata && pageToShow !== 'stamdata' && (
        <Box
          display={'flex'}
          flexDirection={'column'}
          gap={5}
          sx={{marginBottom: 0.5, marginTop: 0.2}}
        >
          <PlotGraph
            ts_id={ts_id}
            dynamicMeasurement={
              pageToShow === stationPages.PEJLING && showForm === true ? dynamic : undefined
            }
          />
          <Divider />
        </Box>
      )}
      <Box sx={{maxWidth: '1080px', width: isTouch ? '100%' : 'fit-content', alignSelf: 'center'}}>
        {pageToShow === 'pejling' && ts_id !== -1 && (
          <Pejling ts_id={ts_id} setDynamic={setDynamic} />
        )}
        {pageToShow === 'tilsyn' && <Tilsyn ts_id={ts_id} canEdit={canEdit} />}
      </Box>
      {pageToShow === 'stamdata' && (
        <EditStamdata ts_id={ts_id} metadata={stamdata} canEdit={canEdit} />
      )}
      {pageToShow === 'billeder' && (
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
            text={'Tilføj billeder'}
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
}

const Layout = ({children, ts_id, stamdata}: LayoutProps) => {
  const [pageToShow] = useStationPages();
  const isCalculated = stamdata ? stamdata?.calculated : false;

  return (
    <Box
      display="flex"
      height={ts_id === -1 && pageToShow === 'pejling' ? '95vh' : 'max-content'}
      flexDirection={'column'}
    >
      <Box
        display={'flex'}
        flexDirection={'column'}
        justifyContent={'space-between'}
        sx={{marginBottom: 0.5, marginTop: 0.2}}
      >
        {children}
      </Box>
      <ActionArea isCalculated={isCalculated} ts_id={ts_id} stamdata={stamdata} />
    </Box>
  );
};
