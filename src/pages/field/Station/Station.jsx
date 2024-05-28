import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import PejlingForm from '~/components/PejlingForm';
import TilsynForm from '~/components/TilsynForm';
import TilsynTable from '~/components/TilsynTable';
import useFormData from '~/hooks/useFormData';
import {stamdataStore} from '~/state/store';
import ActionArea from './ActionArea';
import BearingGraph from './BearingGraph';
import EditStamdata from './EditStamdata';
import PejlingMeasurements from './PejlingMeasurements';
import StationImages from './StationImages';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';
import {Box, Divider, Input} from '@mui/material';
import SaveImageDialog from '../../../components/SaveImageDialog';
import {AddAPhotoRounded, AddCircle, PlaylistAddRounded} from '@mui/icons-material';
import FabWrapper from '~/components/FabWrapper';
import {useSearchParam} from '~/hooks/useSeachParam';

export default function Station({ts_id, stamdata}) {
  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: moment(),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  });

  const [serviceData, setServiceData, changeServiceData, resetServiceData] = useFormData({
    gid: -1,
    dato: moment(),
    batteriskift: false,
    tilsyn: false,
    kommentar: '',
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

      return data.map((m) => {
        return {...m, timeofmeas: moment(m.timeofmeas).format('YYYY-MM-DD HH:mm:ss')};
      });
    },
    enabled: ts_id !== -1 && ts_id !== null,
    initialData: [],
  });

  const {data: services} = useQuery({
    queryKey: ['service', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/service/${ts_id}`);

      return data.map((m) => {
        return {...m, dato: moment(m.dato).format('YYYY-MM-DD HH:mm:ss')};
      });
    },
    enabled: ts_id !== -1 && ts_id !== null,
    initialData: [],
  });

  useEffect(() => {
    if (watlevmp?.length > 0) {
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
    }
  }, [pejlingData, watlevmp]);

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
    // setPageToShow('');
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
    onSuccess: (data) => {
      resetPejlingData();
      setShowForm(null);
      toast.success('Kontrolmåling gemt');
      queryClient.invalidateQueries({
        queryKey: ['measurements', ts_id],
      });
    },
    onError: (error) => {
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
    setPageToShow(null);
  };

  const serviceMutate = useMutation({
    mutationFn: (data) => {
      if (data.gid === -1) {
        return apiClient.post(`/sensor_field/station/service/${ts_id}`, data);
      } else {
        return apiClient.put(`/sensor_field/station/service/${ts_id}/${data.gid}`, data);
      }
    },
  });

  const handleServiceSubmit = () => {
    // setFormToShow("ADDTILSYN");
    const userId = sessionStorage.getItem('user');
    const payload = {
      ...serviceData,
      batteriskift: serviceData.batteriskift.toString(),
      tilsyn: serviceData.tilsyn.toString(),
      userid: userId,
      stationid: ts_id,
    };

    payload.dato = moment(payload.dato).toISOString();

    serviceMutate.mutate(payload, {
      onSuccess: (data) => {
        resetServiceData();
        // setPageToShow('ADDTILSYN');
        setShowForm(null);
        toast.success('Tilsyn gemt');
        queryClient.invalidateQueries({
          queryKey: ['service', ts_id],
        });
      },
      onError: (error) => {
        if (error.response.data.detail.includes('No unit')) {
          toast.error('Der er ingen enhed tilknyttet på denne dato');
        } else {
          toast.error('Der skete en fejl');
        }
      },
    });
  };

  // Regex to find matches on systemx._13, systemx._144, systemx._1423 etc.
  const systemxRegex = /systemx\._\d+/g;

  const handleEdit = (type) => {
    if (type === 'service') {
      return (data) => {
        data.dato = data.dato.replace(' ', 'T').substr(0, 19);
        setServiceData(data);
        setShowForm(true);
        // setPageToShow('');
      };
    } else {
      return (data) => {
        data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
        data.measurement = data.measurement;
        data.useforcorrection = data.useforcorrection.toString();
        setPejlingData(data); // Fill form data on Edit
        setShowForm(true);
        // setPageToShow('');
      };
    }
  };

  const handleDelete = (type) => {
    if (type === 'service') {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/service/${ts_id}/${gid}`).then((res) => {
          queryClient.invalidateQueries({
            queryKey: ['service', ts_id],
          });
          resetServiceData();
          toast.success('Tilsyn slettet');
        });
      };
    } else {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/measurements/${ts_id}/${gid}`).then((res) => {
          queryClient.invalidateQueries({
            queryKey: ['measurements', ts_id],
          });
          resetPejlingData();
          toast.success('Kontrolmåling slettet');
        });
      };
    }
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

  return (
    <>
      {pageToShow !== 'billeder' && pageToShow !== 'STAMDATA' && (
        <Box sx={{marginBottom: 1, marginTop: 1}}>
          <BearingGraph
            stationId={ts_id}
            measurements={control}
            dynamicMeasurement={pageToShow === null ? dynamic : undefined}
          />
          <Divider />
        </Box>
      )}
      <Box sx={{maxWidth: '1080px', margin: 'auto'}}>
        {pageToShow === null && showForm === true && (
          <PejlingForm
            stationId={ts_id}
            formData={pejlingData}
            changeFormData={changePejlingData}
            handleSubmit={handlePejlingSubmit}
            openAddMP={openAddMP}
            resetFormData={() => {
              resetPejlingData();
              setShowForm(null);
              // setPageToShow('ADDPEJLING');
            }}
            canEdit={canEdit}
            mpData={watlevmp}
            isWaterlevel={isWaterlevel}
            isFlow={isFlow}
          />
        )}
        {pageToShow === 'STAMDATA' && (
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
              // setShowData(null);
            }}
            visible={pageToShow === null && showForm === null ? 'visible' : 'hidden'}
          >
            <PejlingMeasurements
              measurements={measurements}
              handleEdit={handleEdit('pejling')}
              handleDelete={handleDelete('pejling')}
              canEdit={canEdit}
            />
          </FabWrapper>
        )}
        <>
          {pageToShow === 'TILSYN' && showForm === true && (
            <TilsynForm
              formData={serviceData}
              changeFormData={changeServiceData}
              handleSubmit={handleServiceSubmit}
              cancel={() => {
                resetServiceData();
                setShowForm(null);
                // setPageToShow('ADDTILSYN');
              }}
            />
          )}
          {pageToShow === 'TILSYN' && (
            <FabWrapper
              icon={<PlaylistAddRounded />}
              text="Tilføj tilsyn"
              onClick={() => {
                setShowForm(true);
                // setPageToShow(null);
              }}
              visible={pageToShow === 'TILSYN' && showForm === null ? 'visible' : 'hidden'}
            >
              <TilsynTable
                services={services}
                handleEdit={handleEdit('service')}
                handleDelete={handleDelete('service')}
                canEdit={canEdit}
              />
            </FabWrapper>
          )}
        </>

        {pageToShow === 'billeder' && (
          <Box>
            <FabWrapper
              icon={<AddAPhotoRounded />}
              text="Tilføj billede"
              onClick={() => {
                // setShowForm(true);
                // setPageToShow('CAMERA');
                fileInputRef.current.click();
              }}
            >
              <StationImages
                locationId={params.locid}
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
    </>
  );
}
