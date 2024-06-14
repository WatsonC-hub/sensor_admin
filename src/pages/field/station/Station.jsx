import {AddAPhotoRounded, AddCircle, PlaylistAddRounded} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import PejlingForm from '~/components/PejlingForm';
import TilsynForm from '~/components/TilsynForm';
import TilsynTable from '~/components/TilsynTable';
import {StationPages} from '~/helpers/EnumHelper';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import useFormData from '~/hooks/useFormData';
import {useSearchParam} from '~/hooks/useSeachParam';
import {stamdataStore} from '~/state/store';

import SaveImageDialog from '../../../components/SaveImageDialog';

import ActionArea from './ActionArea';
import BearingGraph from './BearingGraph';
import EditStamdata from './EditStamdata';
import PejlingMeasurements from './PejlingMeasurements';
import Tilsyn from './tilsyn/Tilsyn';

export default function Station({ts_id, stamdata}) {
  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: moment(),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  });

  let params = useParams();

  const {
    get: {data: watlevmp},
  } = useMaalepunkt();

  const [showForm, setShowForm] = useSearchParam('showForm');

  const [pageToShow, setPageToShow] = useSearchParam('page');

  const [dynamic, setDynamic] = useState([]);
  const [control, setcontrol] = useState([]);
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
  const queryClient = useQueryClient();

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

  const isWaterlevel = stamdata ? stamdata?.tstype_id === 1 : true;
  const isFlow = stamdata ? stamdata?.tstype_id === 2 : false;
  const isCalculated = stamdata ? stamdata?.calculated : false;

  const {data: measurements} = useQuery({
    queryKey: ['measurements', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/measurements/${ts_id}`);
      return data;
    },
    select: (data) =>
      data.map((m) => {
        return {...m, timeofmeas: moment(m.timeofmeas).format('YYYY-MM-DD HH:mm:ss')};
      }),
    enabled: ts_id !== -1 && ts_id !== null,
    initialData: [],
  });

  useEffect(() => {
    if (store.timeseries.tstype_id && watlevmp?.length > 0) {
      const elev = watlevmp?.filter((e2) => {
        return (
          moment(pejlingData.timeofmeas) >= moment(e2.startdate) &&
          moment(pejlingData.timeofmeas) < moment(e2.enddate)
        );
      })[0]?.elevation;

      if (elev) {
        let dynamicDate = moment(pejlingData.timeofmeas).format('YYYY-MM-DD HH:mm:ss');
        let dynamicMeas = elev - pejlingData.measurement;
        setDynamic([dynamicDate, dynamicMeas]);
      } else {
        setDynamic([]);
      }
    } else if (store.timeseries.tstype_id !== 1) {
      let dynamicDate = moment(pejlingData.timeofmeas).format('YYYY-MM-DD HH:mm:ss');
      let dynamicMeas = pejlingData.measurement;
      setDynamic([dynamicDate, dynamicMeas]);
    }
  }, [pejlingData, watlevmp, store.timeseries.tstype_id]);

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
    setcontrol(ctrls);
  }, [watlevmp, measurements]);

  const openAddMP = () => {
    setShowForm(true);
  };

  const pejlingMutate = useMutation({
    mutationKey: 'pejling',
    mutationFn: (data) => {
      if (data.gid === -1) {
        return apiClient.post(`/sensor_field/station/measurements/${data.stationid}`, data);
      } else {
        return apiClient.put(
          `/sensor_field/station/measurements/${data.stationid}/${data.gid}`,
          data
        );
      }
    },
    onSuccess: () => {
      resetPejlingData();
      setShowForm(null);
      toast.success('Kontrolmåling gemt');
      queryClient.invalidateQueries({
        queryKey: ['measurements', ts_id],
      });
    },
    onError: () => {
      toast.error('Der skete en fejl');
    },
  });

  const handlePejlingSubmit = () => {
    const payload = {
      ...pejlingData,
      isWaterlevel: isWaterlevel,
      stationid: ts_id,
    };
    payload.timeofmeas = moment(payload.timeofmeas).toISOString();
    pejlingMutate.mutate(payload);
    setPageToShow(StationPages.PEJLING);
  };

  // Regex to find matches on systemx._13, systemx._144, systemx._1423 etc.

  const handleEdit = () => {
    return (data) => {
      data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
      data.useforcorrection = data.useforcorrection.toString();
      setPejlingData(data); // Fill form data on Edit
      setShowForm(true);
    };
  };

  const handleDelete = () => {
    return (gid) => {
      apiClient.delete(`/sensor_field/station/measurements/${ts_id}/${gid}`).then(() => {
        queryClient.invalidateQueries({
          queryKey: ['measurements', ts_id],
        });
        resetPejlingData();
        toast.success('Kontrolmåling slettet');
      });
    };
  };

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
    resetPejlingData();
    // resetServiceData();
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
        {pageToShow === StationPages.PEJLING && showForm === true && (
          <PejlingForm
            stationId={ts_id}
            formData={pejlingData}
            changeFormData={changePejlingData}
            handleSubmit={handlePejlingSubmit}
            openAddMP={openAddMP}
            resetFormData={() => {
              resetPejlingData();
              setShowForm(null);
            }}
            canEdit={canEdit}
            mpData={watlevmp}
            isWaterlevel={isWaterlevel}
            isFlow={isFlow}
          />
        )}
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
            <PejlingMeasurements
              measurements={measurements}
              handleEdit={handleEdit('pejling')}
              handleDelete={handleDelete('pejling')}
              canEdit={canEdit}
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
        canEdit={canEdit}
        isWaterlevel={isWaterlevel}
        isCalculated={isCalculated}
      />
    </Box>
  );
}