import React, {useEffect, useState} from 'react';
import ActionAreaBorehole from './ActionAreaBorehole';
import BearingGraph from './BearingGraph';
import PejlingFormBorehole from './components/PejlingFormBorehole';
import PejlingMeasurements from './PejlingMeasurements';
import MaalepunktForm from '../../../components/MaalepunktForm';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import MaalepunktTable from './MaalepunktTable';
import {
  insertMeasurement,
  updateMeasurement,
  deleteMeasurement,
  insertMp,
  updateMp,
  getBoreholeMP,
  deleteMP,
  getOurWaterlevel,
} from '../boreholeAPI';
import moment from 'moment';
import BoreholeImages from './BoreholeImages';
import {toast} from 'react-toastify';
import useFormData from '../../../hooks/useFormData';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';

function formatedTimestamp(d) {
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date} ${time}`;
}

const Boreholeno = ({boreholeno, intakeno}) => {
  let location = useLocation();
  let navigate = useNavigate();
  let params = useParams();
  const queryClient = useQueryClient();

  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: formatedTimestamp(new Date()),
    pumpstop: formatedTimestamp(new Date()),
    disttowatertable_m: 0,
    service: 0,
    comment: '',
  });

  const formToShow = location.hash ? location.hash.replace('#', '') : null;

  const setFormToShow = (form) => {
    if (form) {
      navigate('#' + form, {replace: location.hash !== ''});
    } else {
      navigate(-1);
    }
  };

  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: formatedTimestamp(new Date()),
    enddate: formatedTimestamp(new Date('2099-01-01')),
    elevation: 0,
    mp_description: '',
  });

  const [updated, setUpdated] = useState(new Date());
  const [control, setcontrol] = useState([]);
  const [dynamic, setDynamic] = useState([]);
  const [canEdit] = useState(true);

  const {data: measurements} = useQuery(
    ['measurements', boreholeno],
    () => getOurWaterlevel(boreholeno, intakeno),
    {
      enabled: boreholeno !== -1 && boreholeno !== null,
      placeholderData: [],
    }
  );

  const {data: watlevmp} = useQuery(
    ['watlevmp', boreholeno],
    () => getBoreholeMP(boreholeno, intakeno),
    {
      enabled: boreholeno !== -1 && boreholeno !== null,
      placeholderData: [],
    }
  );

  useEffect(() => {
    if (watlevmp.length > 0) {
      const elev = watlevmp.filter((e2) => {
        return (
          moment(pejlingData.timeofmeas) >= moment(e2.startdate) &&
          moment(pejlingData.timeofmeas) < moment(e2.enddate)
        );
      })[0].elevation;

      let dynamicDate = pejlingData.timeofmeas;
      let dynamicMeas = elev - pejlingData.disttowatertable_m;
      setDynamic([dynamicDate, dynamicMeas]);
    }
  }, [pejlingData, watlevmp]);

  useEffect(() => {
    var ctrls = [];
    if (watlevmp.length > 0) {
      ctrls = measurements.map((e) => {
        const elev = watlevmp.filter((e2) => {
          return (
            moment(e.timeofmeas) >= moment(e2.startdate) &&
            moment(e.timeofmeas) < moment(e2.enddate)
          );
        })[0].elevation;

        return {
          ...e,
          waterlevel: e.disttowatertable_m ? elev - e.disttowatertable_m : null,
        };
      });
    } else {
      ctrls = measurements.map((elem) => {
        return {...elem, waterlevel: elem.disttowatertable_m};
      });
    }
    setcontrol(ctrls);
  }, [watlevmp, measurements]);

  const handleMpCancel = () => {
    resetMpData();
    setFormToShow(null);
  };

  const pejlingMutate = useMutation((data) => {
    if (data.gid === -1) {
      return insertMeasurement(boreholeno, intakeno, data);
    } else {
      return updateMeasurement(boreholeno, intakeno, data);
    }
  });

  const handlePejlingSubmit = () => {
    //setFormToShow(null);
    const userId = sessionStorage.getItem('user');
    const payload = {
      ...pejlingData,
      userid: userId,
    };
    var _date = Date.parse(payload.timeofmeas);
    var _datePumpStop = Date.parse(payload.pumpstop);
    payload.timeofmeas = formatedTimestamp(new Date(_date));
    payload.pumpstop = formatedTimestamp(new Date(_datePumpStop));
    if (payload.service) payload.pumpstop = null;
    pejlingMutate.mutate(payload, {
      onSuccess: (data) => {
        resetPejlingData();
        setFormToShow(null);
        toast.success('Kontrolmåling gemt');
        queryClient.invalidateQueries(['measurements', boreholeno]);
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const watlevmpMutate = useMutation((data) => {
    if (data.gid === -1) {
      return insertMp(boreholeno, intakeno, data);
    } else {
      return updateMp(boreholeno, intakeno, data);
    }
  });

  const handleMpSubmit = () => {
    const userId = sessionStorage.getItem('user');
    const payload = {...mpData, userid: userId};
    var _date = Date.parse(payload.startdate);
    payload.startdate = formatedTimestamp(new Date(_date));
    payload.enddate = formatedTimestamp(new Date(Date.parse(payload.enddate)));
    watlevmpMutate.mutate(payload, {
      onSuccess: (data) => {
        resetMpData();
        toast.success('Målepunkt gemt');
        queryClient.invalidateQueries(['watlevmp', boreholeno]);
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const handleEdit = (type) => {
    if (type === 'watlevmp') {
      return (data) => {
        data.startdate = data.startdate.replace(' ', 'T').substr(0, 19);
        data.enddate = data.enddate.replace(' ', 'T').substr(0, 19);
        setMpData(data); // Fill form data on Edit
        setFormToShow('ADDMAALEPUNKT'); // update to use state machine
        // setUpdated(new Date());
      };
    } else {
      return (data) => {
        console.log(data);
        data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
        setPejlingData(data); // Fill form data on Edit
        setFormToShow('ADDPEJLING'); // update to use state machine
        // setUpdated(new Date());
      };
    }
  };

  const handleDelete = (type) => {
    if (type === 'watlevmp') {
      return (gid) => {
        deleteMP(boreholeno, intakeno, gid).then((res) => {
          queryClient.invalidateQueries(['watlevmp', boreholeno]);
          resetMpData();
          setUpdated(new Date());
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid) => {
        deleteMeasurement(boreholeno, intakeno, gid).then((res) => {
          queryClient.invalidateQueries(['measurements', boreholeno]);
          resetPejlingData();
          setUpdated(new Date());
          toast.success('Kontrolmåling slettet');
        });
      };
    }
  };

  return (
    <div>
      {formToShow !== 'CAMERA' && (
        <BearingGraph
          boreholeno={boreholeno}
          intakeno={intakeno}
          updated={updated}
          measurements={control}
          dynamicMeasurement={formToShow !== 'ADDPEJLING' ? undefined : dynamic}
        />
      )}
      {formToShow === 'ADDPEJLING' && (
        <PejlingFormBorehole
          boreholeno={boreholeno}
          intakeno={intakeno}
          formData={pejlingData}
          changeFormData={changePejlingData}
          handleSubmit={handlePejlingSubmit}
          resetFormData={() => {
            resetPejlingData();
            setFormToShow(null);
          }}
          canEdit={canEdit}
          mpData={watlevmp}
          isWaterlevel={true}
          isFlow={false}
        />
      )}
      {formToShow === 'ADDMAALEPUNKT' && (
        <div>
          <MaalepunktForm
            boreholeno={boreholeno}
            formData={mpData}
            changeFormData={changeMpData}
            handleSubmit={handleMpSubmit}
            resetFormData={resetMpData}
            handleCancel={handleMpCancel}
            canEdit={canEdit}
          ></MaalepunktForm>
          <MaalepunktTable
            watlevmp={watlevmp}
            handleEdit={handleEdit('watlevmp')}
            handleDelete={handleDelete('watlevmp')}
            canEdit={canEdit}
          ></MaalepunktTable>
        </div>
      )}
      {(formToShow === null || formToShow === 'ADDPEJLING') && (
        <PejlingMeasurements
          measurements={measurements}
          handleEdit={handleEdit('pejling')}
          handleDelete={handleDelete('pejling')}
          canEdit={canEdit}
        />
      )}
      {formToShow === 'CAMERA' && <BoreholeImages boreholeno={params.boreholeno} />}
      <ActionAreaBorehole
        open={open}
        boreholeno={boreholeno}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
      />
    </div>
  );
};

export default Boreholeno;
