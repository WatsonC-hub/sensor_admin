import {AddAPhotoRounded, AddCircle, PlaylistAddRounded} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';

import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import SaveImageDialog from '~/components/SaveImageDialog';
import {usePejling} from '~/features/api/usePejling';
import {StationPages} from '~/helpers/EnumHelper';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {useSearchParam} from '~/hooks/useSeachParam';
import ActionArea from '~/pages/field/station/ActionArea';
import BearingGraph from '~/pages/field/station/BearingGraph';
import EditStamdata from '~/pages/field/station/EditStamdata';
import Pejling from '~/pages/field/station/pejling/Pejling';
import Tilsyn from '~/pages/field/station/tilsyn/Tilsyn';
import {stamdataStore} from '~/state/store';

export default function Station({ts_id, stamdata}) {
  let params = useParams();
  const [showForm, setShowForm] = useSearchParam('showForm');
  const [pageToShow, setPageToShow] = useSearchParam('page');

  const [dynamic, setDynamic] = useState([]);
  const [control, setControl] = useState([]);
  const [canEdit] = useState(true);
  const fileInputRef = useRef(null);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);
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

  const {
    get: {data: watlevmp},
  } = useMaalepunkt();
  const {
    get: {data: measurements},
  } = usePejling();

  const isCalculated = stamdata ? stamdata?.calculated : false;

  useEffect(() => {
    var ctrls = [];
    if (watlevmp?.length > 0) {
      ctrls = measurements?.map((e) => {
        const elev = watlevmp?.filter((e2) => {
          return e.timeofmeas >= e2.startdate && e.timeofmeas < e2.enddate;
        })[0]?.elevation;
        return {
          ...e,
          waterlevel: e.measurement != null ? elev - e.measurement : null,
        };
      });
    } else {
      ctrls = measurements?.map((elem) => {
        return {...elem, waterlevel: elem.measurement};
      });
    }
    setControl(ctrls);
  }, [watlevmp, measurements]);

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
    setShowForm(true);
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    handleSetDataURI(base64);
  };

  const handleFileInputClick = () => {
    if (openSave !== true) fileInputRef.current.value = null;
  };

  useEffect(() => {
    setPageToShow(pageToShow);
    if (stamdata.calculated && pageToShow == StationPages.TILSYN) setPageToShow(null);
    setShowForm(null);
  }, [ts_id]);

  return (
    <Box display="flex" flexDirection={'column'}>
      {pageToShow !== StationPages.BILLEDER && pageToShow !== StationPages.STAMDATA && (
        <Box sx={{marginBottom: 1, marginTop: 1}}>
          <BearingGraph
            stationId={ts_id}
            measurements={control}
            dynamicMeasurement={
              pageToShow === StationPages.PEJLING && showForm === true ? dynamic : undefined
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
        {pageToShow === StationPages.STAMDATA && (
          <EditStamdata
            setFormToShow={setShowForm}
            ts_id={ts_id}
            metadata={stamdata}
            canEdit={canEdit}
          />
        )}
        {pageToShow === null && (
          <FabWrapper
            icon={<AddCircle />}
            text="Tilføj kontrol"
            onClick={() => {
              setShowForm(true);
            }}
            visible={
              pageToShow === StationPages.PEJLING && showForm === null ? 'visible' : 'hidden'
            }
          >
            <Pejling
              ts_id={ts_id}
              showForm={showForm}
              setShowForm={setShowForm}
              setDynamic={setDynamic}
            />
          </FabWrapper>
        )}
        {pageToShow === StationPages.TILSYN && (
          <FabWrapper
            icon={<PlaylistAddRounded />}
            text={'Tilføj ' + StationPages.TILSYN}
            onClick={() => {
              setShowForm(true);
            }}
            visible={pageToShow === StationPages.TILSYN && showForm === null ? 'visible' : 'hidden'}
          >
            <Tilsyn ts_id={ts_id} showForm={showForm} setShowForm={setShowForm} canEdit={canEdit} />
          </FabWrapper>
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
      </Box>
      <ActionArea
        pageToShow={pageToShow}
        setPageToShow={setPageToShow}
        showForm={showForm}
        setShowForm={setShowForm}
        isCalculated={isCalculated}
      />
    </Box>
  );
}
