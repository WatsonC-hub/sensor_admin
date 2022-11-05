import React, {useEffect, useState} from 'react';
import BearingGraph from './BearingGraph';
import ActionArea from './ActionArea';
import PejlingForm from '../../../components/PejlingForm';
import {
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  getMeasurements,
  insertMp,
  updateMp,
  getMP,
  deleteMP,
  getStamdataByStation,
  getService,
  updateService,
  insertService,
  deleteService,
} from 'src/pages/field/fieldAPI';
import EditStamdata from './EditStamdata';
import PejlingMeasurements from './PejlingMeasurements';
import MaalepunktForm from '../../../components/MaalepunktForm';
import moment from 'moment';
import MaalepunktTable from './MaalepunktTable';
import TilsynForm from '../../../components/TilsynForm';
import TilsynTable from '../../../components/TilsynTable';
import StationImages from './StationImages';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {stamdataStore} from '../../../state/store';
import {toast} from 'react-toastify';
import useFormData from '../../../hooks/useFormData';

export default function Station({stationId}) {
  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: new Date(),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  });

  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: new Date(),
    enddate: new Date('2099-01-01'),
    elevation: 0,
    mp_description: '',
  });

  const [serviceData, setServiceData, changeServiceData, resetServiceData] = useFormData({
    gid: -1,
    dato: new Date(),
    batteriskift: false,
    tilsyn: false,
    kommentar: '',
  });

  // const [formToShow, setFormToShow] = useState(null);

  let location = useLocation();
  let navigate = useNavigate();
  let params = useParams();

  const formToShow = location.hash ? location.hash.replace('#', '') : null;

  const setFormToShow = form => {
    if (form) {
      navigate('#' + form, {replace: location.hash !== ''});
    } else {
      navigate(`/field/location/${params.locid}/${params.statid}`, {
        replace: true,
      });
    }
  };

  const [dynamic, setDynamic] = useState([]);
  const [control, setcontrol] = useState([]);
  const [canEdit] = useState(true);
  const [isWaterlevel, setIsWaterlevel] = useState(false);
  const [isCalculated, setIsCalculated] = useState(false);
  const [isFlow, setIsFlow] = useState(false);

  const store = stamdataStore();
  const queryClient = useQueryClient();

  useEffect(() => {
    return () => {
      store.resetLocation();
      store.resetTimeseries();
      store.resetUnit();
    };
  }, []);

  const {data: stamdata} = useQuery(
    ['stamdata', stationId],
    () => getStamdataByStation(stationId),
    {
      enabled: stationId !== -1 && stationId !== null,
      onSuccess: data => {
        setIsWaterlevel(data.tstype_id === 1);
        setIsFlow(data.tstype_id === 2);
        setIsCalculated(data.calculated);
        store.setLocation(data);
        store.setTimeseries(data);
        store.setUnit(data);
      },
      refetchOnWindowFocus: false,
    }
  );

  const {data: watlevmp} = useQuery(['watlevmp', stationId], () => getMP(stationId), {
    enabled: stationId !== -1 && stationId !== null,
    placeholderData: [],
  });

  const {data: measurements} = useQuery(
    ['measurements', stationId],
    () => getMeasurements(stationId),
    {
      enabled: stationId !== -1 && stationId !== null,
      placeholderData: [],
    }
  );

  const {data: services} = useQuery(['service', stationId], () => getService(stationId), {
    enabled: stationId !== -1 && stationId !== null,
    placeholderData: [],
  });

  useEffect(() => {
    if (watlevmp.length > 0) {
      const elev = watlevmp.filter(e2 => {
        return (
          moment(pejlingData.timeofmeas) >= moment(e2.startdate) &&
          moment(pejlingData.timeofmeas) < moment(e2.enddate)
        );
      })[0]?.elevation;

      if (elev) {
        let dynamicDate = pejlingData.timeofmeas;
        let dynamicMeas = elev - pejlingData.measurement;
        setDynamic([dynamicDate, dynamicMeas]);
      } else {
        setDynamic([]);
      }
    }
  }, [pejlingData, watlevmp]);

  useEffect(() => {
    var ctrls = [];
    if (watlevmp.length > 0) {
      ctrls = measurements.map(e => {
        const elev = watlevmp.filter(e2 => {
          return e.timeofmeas >= e2.startdate && e.timeofmeas < e2.enddate;
        })[0].elevation;

        return {
          ...e,
          waterlevel: e.measurement ? elev - e.measurement : null,
        };
      });
    } else {
      ctrls = measurements.map(elem => {
        return {...elem, waterlevel: elem.measurement};
      });
    }
    setcontrol(ctrls);
  }, [watlevmp, measurements]);

  const handleMpCancel = () => {
    resetMpData();
    setFormToShow(null);
  };

  const pejlingMutate = useMutation(data => {
    if (data.gid === -1) {
      return insertMeasurement(data);
    } else {
      return updateMeasurement(data);
    }
  });

  const handlePejlingSubmit = () => {
    setFormToShow(null);
    const userId = sessionStorage.getItem('user');
    const payload = {
      ...pejlingData,
      stationid: stationId,
      userid: userId,
      isWaterlevel: isWaterlevel,
    };
    payload.timeofmeas = moment(payload.timeofmeas).format('YYYY-MM-DD HH:mm:ss');
    pejlingMutate.mutate(payload, {
      onSuccess: data => {
        resetPejlingData();
        setFormToShow(null);
        toast.success('Kontrolmåling gemt');
        queryClient.invalidateQueries(['measurements', stationId]);
      },
      onError: error => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const watlevmpMutate = useMutation(data => {
    if (data.gid === -1) {
      return insertMp(data);
    } else {
      return updateMp(data);
    }
  });

  const handleMpSubmit = () => {
    // setFormToShow("ADDMAALEPUNKT");
    const userId = sessionStorage.getItem('user');
    const payload = {...mpData, userid: userId, stationid: stationId};
    payload.startdate = moment(payload.startdate).format('YYYY-MM-DD HH:mm:ss');
    payload.enddate = moment(payload.enddate).format('YYYY-MM-DD HH:mm:ss');

    watlevmpMutate.mutate(payload, {
      onSuccess: data => {
        resetMpData();
        toast.success('Målepunkt gemt');
        queryClient.invalidateQueries(['watlevmp', stationId]);
      },
      onError: error => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const serviceMutate = useMutation(data => {
    if (data.gid === -1) {
      return insertService(data);
    } else {
      return updateService(data);
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

    payload.dato = moment(payload.dato).format('YYYY-MM-DD HH:mm:ss');

    serviceMutate.mutate(payload, {
      onSuccess: data => {
        resetServiceData();
        toast.success('Tilsyn gemt');
        queryClient.invalidateQueries(['service', stationId]);
      },
      onError: error => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const handleEdit = type => {
    if (type === 'watlevmp') {
      return data => {
        setMpData(data); // Fill form data on Edit
        setFormToShow('ADDMAALEPUNKT');
      };
    } else if (type === 'service') {
      return data => {
        data.dato = data.dato.replace(' ', 'T').substr(0, 19);
        setServiceData(data);
        setFormToShow('ADDTILSYN');
      };
    } else {
      return data => {
        data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
        setPejlingData(data); // Fill form data on Edit
        setFormToShow('ADDPEJLING');
      };
    }
  };

  const handleDelete = type => {
    if (type === 'watlevmp') {
      return gid => {
        deleteMP(stationId, gid).then(res => {
          queryClient.invalidateQueries(['watlevmp', stationId]);
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else if (type === 'service') {
      return gid => {
        deleteService(stationId, gid).then(res => {
          queryClient.invalidateQueries(['services', stationId]);
          resetServiceData();
          toast.success('Tilsyn slettet');
        });
      };
    } else {
      return gid => {
        deleteMeasurement(stationId, gid).then(res => {
          queryClient.invalidateQueries(['measurements', stationId]);
          resetPejlingData();
          setFormToShow(null);
          toast.success('Kontrolmåling slettet');
        });
      };
    }
  };

  return (
    // <>
    <div>
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
        <EditStamdata setFormToShow={setFormToShow} stationId={stationId} />
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
            resetFormData={() => setFormToShow(null)}
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
    </div>
  );
}
