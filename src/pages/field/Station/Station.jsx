import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {toast} from 'react-toastify';
import {apiClient} from 'src/apiClient';
import MaalepunktForm from '../../../components/MaalepunktForm';
import PejlingForm from '../../../components/PejlingForm';
import TilsynForm from '../../../components/TilsynForm';
import TilsynTable from '../../../components/TilsynTable';
import useFormData from '../../../hooks/useFormData';
import {stamdataStore} from '../../../state/store';
import ActionArea from './ActionArea';
import BearingGraph from './BearingGraph';
import EditStamdata from './EditStamdata';
import MaalepunktTable from './MaalepunktTable';
import PejlingMeasurements from './PejlingMeasurements';
import StationImages from './StationImages';

export default function Station({stationId, stamdata}) {
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

  const {data: watlevmp} = useQuery(
    ['watlevmp', stationId],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/watlevmp/${stationId}`);

      return data.map((m) => {
        return {
          ...m,
          startdate: moment(m.startdate).format('YYYY-MM-DD HH:mm:ss'),
          enddate: moment(m.enddate).format('YYYY-MM-DD HH:mm:ss'),
        };
      });
    },
    {
      enabled: stationId !== -1 && stationId !== null,
      initialData: [],
    }
  );

  const {data: measurements} = useQuery(
    ['measurements', stationId],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/measurements/${stationId}`);

      return data.map((m) => {
        return {...m, timeofmeas: moment(m.timeofmeas).format('YYYY-MM-DD HH:mm:ss')};
      });
    },
    {
      enabled: stationId !== -1 && stationId !== null,
      initialData: [],
    }
  );

  const {data: services} = useQuery(
    ['service', stationId],
    async () => {
      const {data} = await apiClient.get(`/sensor_field/station/service/${stationId}`);

      return data.map((m) => {
        return {...m, dato: moment(m.dato).format('YYYY-MM-DD HH:mm:ss')};
      });
    },
    {
      enabled: stationId !== -1 && stationId !== null,
      initialData: [],
    }
  );

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

  const pejlingMutate = useMutation(
    (data) => {
      if (data.gid === -1) {
        return apiClient.post(`/sensor_field/station/measurements/${data.stationid}`, data);
      } else {
        return apiClient.put(
          `/sensor_field/station/measurements/${data.stationid}/${data.gid}`,
          data
        );
      }
    },
    {
      mutationKey: 'pejling',
      onSuccess: (data) => {
        resetPejlingData();
        setFormToShow(null);
        toast.success('Kontrolmåling gemt');
        queryClient.invalidateQueries(['measurements', stationId]);
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    }
  );

  const handlePejlingSubmit = () => {
    const payload = {
      ...pejlingData,
      isWaterlevel: isWaterlevel,
      stationid: stationId,
    };
    payload.timeofmeas = moment(payload.timeofmeas).toISOString();
    pejlingMutate.mutate(payload);
  };

  const watlevmpMutate = useMutation((data) => {
    if (data.gid === -1) {
      return apiClient.post(`/sensor_field/station/watlevmp/${stationId}`, data);
    } else {
      return apiClient.put(`/sensor_field/station/watlevmp/${stationId}/${data.gid}`, data);
    }
  });

  const handleMpSubmit = () => {
    const payload = {...mpData, stationid: stationId};
    payload.startdate = moment(payload.startdate).toISOString();
    payload.enddate = moment(payload.enddate).toISOString();

    watlevmpMutate.mutate(payload, {
      onSuccess: (data) => {
        resetMpData();
        toast.success('Målepunkt gemt');
        queryClient.invalidateQueries(['watlevmp', stationId]);
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const serviceMutate = useMutation((data) => {
    if (data.gid === -1) {
      return apiClient.post(`/sensor_field/station/service/${stationId}`, data);
    } else {
      return apiClient.put(`/sensor_field/station/service/${stationId}/${data.gid}`, data);
    }
  });

  const handleServiceSubmit = () => {
    // setFormToShow("ADDTILSYN");
    const userId = sessionStorage.getItem('user');
    const payload = {
      ...serviceData,
      batteriskift: serviceData.batteriskift.toString(),
      tilsyn: serviceData.tilsyn.toString(),
      userid: userId,
      stationid: stationId,
    };

    payload.dato = moment(payload.dato).toISOString();

    serviceMutate.mutate(payload, {
      onSuccess: (data) => {
        resetServiceData();
        toast.success('Tilsyn gemt');
        queryClient.invalidateQueries(['service', stationId]);
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
        apiClient.delete(`/sensor_field/station/watlevmp/${stationId}/${gid}`).then((res) => {
          queryClient.invalidateQueries(['watlevmp', stationId]);
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else if (type === 'service') {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/service/${stationId}/${gid}`).then((res) => {
          queryClient.invalidateQueries(['service', stationId]);
          resetServiceData();
          toast.success('Tilsyn slettet');
        });
      };
    } else {
      return (gid) => {
        apiClient.delete(`/sensor_field/station/measurements/${stationId}/${gid}`).then((res) => {
          queryClient.invalidateQueries(['measurements', stationId]);
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
        stationId={stationId}
        measurements={control}
        dynamicMeasurement={formToShow === 'ADDPEJLING' ? dynamic : undefined}
      />

      {formToShow === 'ADDPEJLING' && (
        <PejlingForm
          stationId={stationId}
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
        <EditStamdata setFormToShow={setFormToShow} ts_id={stationId} metadata={stamdata} />
      )}
      {formToShow === 'ADDMAALEPUNKT' && (
        <>
          <MaalepunktForm
            formData={mpData}
            changeFormData={changeMpData}
            handleSubmit={handleMpSubmit}
            resetFormData={resetMpData}
            handleCancel={handleMpCancel}
            canEdit={canEdit}
          />
          <MaalepunktTable
            watlevmp={watlevmp}
            handleEdit={handleEdit('watlevmp')}
            handleDelete={handleDelete('watlevmp')}
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
        stationId={stationId}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
        isWaterlevel={isWaterlevel}
        isCalculated={isCalculated}
      />
    </>
  );
}
