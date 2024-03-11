import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import MaalepunktForm from '~/components/MaalepunktForm';
import PejlingForm from '~/components/PejlingForm';
import TilsynForm from '~/components/TilsynForm';
import TilsynTable from '~/components/TilsynTable';
import useFormData from '~/hooks/useFormData';
import {stamdataStore} from '~/state/store';
import ActionArea from './ActionArea';
import BearingGraph from './BearingGraph';
import EditStamdata from './EditStamdata';
import MaalepunktTable from './MaalepunktTable';
import PejlingMeasurements from './PejlingMeasurements';
import StationImages from './StationImages';
import {useMaalepunkt} from '~/hooks/query/useMaalepunkt';

export default function Station({stationId: ts_id, stamdata}) {
  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: moment(),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  });

  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: moment(),
    enddate: moment('2099-01-01'),
    elevation: 0,
    mp_description: '',
  });

  const [serviceData, setServiceData, changeServiceData, resetServiceData] = useFormData({
    gid: -1,
    dato: moment(),
    batteriskift: false,
    tilsyn: false,
    kommentar: '',
  });

  let location = useLocation();
  let navigate = useNavigate();
  let params = useParams();

  const {
    get: {data: watlevmp},
    post: postWatlevmp,
    put: putWatlevmp,
    del: deleteWatlevmp,
  } = useMaalepunkt();

  const formToShow = location.hash ? location.hash.replace('#', '') : null;
  const setFormToShow = (form) => {
    if (form) {
      navigate('#' + form, {replace: !!location.hash});
    } else {
      navigate(-1);
    }
  };

  const [dynamic, setDynamic] = useState([]);
  const [control, setcontrol] = useState([]);
  const [canEdit] = useState(true);

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

  const handleMpCancel = () => {
    resetMpData();
    setFormToShow(null);
  };

  const openAddMP = () => {
    setFormToShow('ADDMAALEPUNKT');
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
      setFormToShow(null);
      toast.success('Kontrolmåling gemt');
      queryClient.invalidateQueries(['measurements', ts_id]);
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
  };

  const watlevmpMutate = useMutation({
    mutationFn: (data) => {
      if (data.gid === -1) {
        return apiClient.post(`/sensor_field/station/watlevmp/${ts_id}`, data);
      } else {
        return apiClient.put(`/sensor_field/station/watlevmp/${ts_id}/${data.gid}`, data);
      }
    },
  });

  const handleMaalepunktSubmit = () => {
    // const payload = mpData;

    mpData.startdate = moment(mpData.startdate).toISOString();
    mpData.enddate = moment(mpData.enddate).toISOString();

    console.log('mpData', mpData);
    const mutationOptions = {
      onSuccess: (data) => {
        resetMpData();
      },
    };

    if (mpData.gid === -1) {
      const payload = {
        data: mpData,
        path: `${ts_id}`,
      };
      postWatlevmp.mutate(payload, mutationOptions);
    } else {
      const payload = {
        data: mpData,
        path: `${ts_id}/${mpData.gid}`,
      };
      putWatlevmp.mutate(payload, mutationOptions);
    }
  };

  const handleDeleteMaalepunkt = (gid) => {
    deleteWatlevmp.mutate(
      {path: `${ts_id}/${gid}`},
      {
        onSuccess: (data) => {
          resetMpData();
        },
      }
    );
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
        toast.success('Tilsyn gemt');
        queryClient.invalidateQueries(['service', ts_id]);
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
    if (type === 'watlevmp') {
      return (data) => {
        setMpData(data); // Fill form data on Edit
        setFormToShow('ADDMAALEPUNKT');
      };
    } else if (type === 'service') {
      return (data) => {
        data.dato = data.dato.replace(' ', 'T').substr(0, 19);
        setServiceData(data);
        setFormToShow('ADDTILSYN');
      };
    } else {
      return (data) => {
        data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
        data.measurement = data.measurement;
        data.useforcorrection = data.useforcorrection.toString();
        setPejlingData(data); // Fill form data on Edit
        setFormToShow('ADDPEJLING');
      };
    }
  };

  const handleDelete = (type) => {
    if (type === 'watlevmp') {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/watlevmp/${ts_id}/${gid}`).then((res) => {
          queryClient.invalidateQueries(['watlevmp', ts_id]);
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else if (type === 'service') {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/service/${ts_id}/${gid}`).then((res) => {
          queryClient.invalidateQueries(['service', ts_id]);
          resetServiceData();
          toast.success('Tilsyn slettet');
        });
      };
    } else {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/measurements/${ts_id}/${gid}`).then((res) => {
          queryClient.invalidateQueries(['measurements', ts_id]);
          resetPejlingData();
          toast.success('Kontrolmåling slettet');
        });
      };
    }
  };

  return (
    // <>
    <>
      <BearingGraph
        stationId={ts_id}
        measurements={control}
        dynamicMeasurement={formToShow === 'ADDPEJLING' ? dynamic : undefined}
      />

      {formToShow === 'ADDPEJLING' && (
        <PejlingForm
          stationId={ts_id}
          formData={pejlingData}
          changeFormData={changePejlingData}
          handleSubmit={handlePejlingSubmit}
          openAddMP={openAddMP}
          resetFormData={() => {
            resetPejlingData();
            setFormToShow(null);
          }}
          canEdit={canEdit}
          mpData={watlevmp}
          isWaterlevel={isWaterlevel}
          isFlow={isFlow}
        />
      )}
      {formToShow === 'RET_STAMDATA' && (
        <EditStamdata setFormToShow={setFormToShow} ts_id={ts_id} metadata={stamdata} />
      )}
      {formToShow === 'ADDMAALEPUNKT' && (
        <>
          <MaalepunktForm
            formData={mpData}
            changeFormData={changeMpData}
            handleSubmit={handleMaalepunktSubmit}
            resetFormData={resetMpData}
            handleCancel={handleMpCancel}
            canEdit={canEdit}
          />
          <MaalepunktTable
            watlevmp={watlevmp}
            handleEdit={handleEdit('watlevmp')}
            handleDelete={handleDeleteMaalepunkt}
            canEdit={canEdit}
          />
        </>
      )}
      {(formToShow === null || formToShow === 'ADDPEJLING') && (
        <PejlingMeasurements
          measurements={measurements}
          handleEdit={handleEdit('pejling')}
          handleDelete={handleDelete('pejling')}
          canEdit={canEdit}
        />
      )}
      {formToShow === 'ADDTILSYN' && (
        <>
          <TilsynForm
            formData={serviceData}
            changeFormData={changeServiceData}
            handleSubmit={handleServiceSubmit}
            cancel={() => {
              resetServiceData();
              setFormToShow(null);
            }}
          />
          <TilsynTable
            services={services}
            handleEdit={handleEdit('service')}
            handleDelete={handleDelete('service')}
            canEdit={canEdit}
          />
        </>
      )}
      {formToShow === 'CAMERA' && <StationImages locationId={params.locid} />}
      <ActionArea
        stationId={ts_id}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
        isWaterlevel={isWaterlevel}
        isCalculated={isCalculated}
      />
    </>
  );
}
