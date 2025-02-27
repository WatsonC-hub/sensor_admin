import {AddAPhotoRounded} from '@mui/icons-material';
import AddIcon from '@mui/icons-material/Add';
import AutoGraphIcon from '@mui/icons-material/AutoGraph';
import {Box, Divider, Typography} from '@mui/material';
import moment from 'moment';
import React, {ChangeEvent, createRef, ReactNode, useEffect, useState} from 'react';

import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import NavBar from '~/components/NavBar';
import NotificationList from '~/components/NotificationList';
import SaveImageDialog from '~/components/SaveImageDialog';
import {useUser} from '~/features/auth/useUser';
import ActionArea from '~/features/station/components/ActionArea';
// import ActionArea from '~/features/station/components/ActionArea';
import BatteryStatus from '~/features/station/components/BatteryStatus';
import MinimalSelect from '~/features/station/components/MinimalSelect';
import StationDrawer from '~/features/station/components/StationDrawer';
import PlotGraph from '~/features/station/components/StationGraph';
import {stationPages} from '~/helpers/EnumHelper';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import Pejling from '~/pages/field/station/pejling/Pejling';
import EditStamdata from '~/pages/field/station/stamdata/EditStamdata';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {useAppContext} from '~/state/contexts';

export default function Station() {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData();
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

  useEffect(() => {
    setPageToShow(pageToShow);
    if (metadata?.calculated && pageToShow == 'tilsyn') setPageToShow('pejling');

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

      {pageToShow === 'pejling' && ts_id !== -1 && <Pejling setDynamic={setDynamic} />}
      {pageToShow === 'tilsyn' && <Tilsyn />}
      {pageToShow === 'stamdata' && <EditStamdata />}
      {pageToShow === 'billeder' && (
        <>
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
          <input
            type="file"
            ref={fileInputRef}
            accept="image/jpeg, image/png, image/webp, image/avif, image/svg, image/gif, image/tif"
            style={{display: 'none'}}
            onChange={handleFileRead}
          />
        </>
      )}
    </Layout>
  );
}

interface LayoutProps {
  children: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: locationdata} = useLocationData();
  const {data: metadata} = useTimeseriesData();
  const user = useUser();
  const {adminKvalitetssikring, createStamdata} = useNavigationFunctions();
  return (
    <>
      <NavBar>
        <NavBar.GoBack />
        <Box display="block" flexGrow={1} overflow="hidden">
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {locationdata?.loc_name}
          </Typography>
          <MinimalSelect />
        </Box>
        <Box display="flex" justifyContent="center" alignItems="center" flexShrink={0}>
          <BatteryStatus />
          <NavBar.Home />
          {user?.adminAccess && <NotificationList />}
          <NavBar.Menu
            highligtFirst={false}
            items={[
              ...(user?.adminAccess && !metadata?.calculated
                ? [
                    {
                      title: 'Til QA',
                      onClick: () => {
                        adminKvalitetssikring(ts_id ?? -1);
                      },
                      icon: <AutoGraphIcon />,
                    },
                  ]
                : []),
              {
                title: 'Opret tidsserie',
                icon: <AddIcon />,
                onClick: () => {
                  createStamdata(undefined, {state: {...metadata}});
                },
              },
            ]}
          />
        </Box>
      </NavBar>
      <Box component="main" sx={{flexGrow: 1, display: 'flex', flexDirection: 'row'}}>
        <StationDrawer />
        <Box display="flex" flexGrow={1} flexDirection={'column'} gap={1}>
          {children}
          <ActionArea />
        </Box>
      </Box>
    </>
  );
};
