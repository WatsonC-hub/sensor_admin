import React, {useEffect, useState} from 'react';
import ActionArea from './ActionArea';
import BearingGraph from './BearingGraph';
import PejlingFormBorehole from './PejlingFormBorehole';
import PejlingMeasurements from './PejlingMeasurements';
import MaalepunktForm from '../../../components/MaalepunktForm';
import {useLocation} from 'react-router-dom';
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
import MuiAlert from '@mui/material/Alert';
import Snackbar from '@mui/material/Snackbar';

function formatedTimestamp(d) {
  const date = d.toISOString().split('T')[0];
  const time = d.toTimeString().split(' ')[0];
  return `${date} ${time}`;
}

const Boreholeno = ({boreholeno, intakeno, setShowForm, open, formToShow, setFormToShow}) => {
  let location = useLocation();

  //console.log(boreholeno);
  const [pejlingData, setPejlingData] = useState({
    gid: -1,
    timeofmeas: formatedTimestamp(new Date()),
    pumpstop: formatedTimestamp(new Date()),
    disttowatertable_m: 0,
    service: 0,
    comment: '',
  });

  const [mpData, setMpData] = useState({
    gid: -1,
    startdate: formatedTimestamp(new Date()),
    enddate: formatedTimestamp(new Date('2099-01-01')),
    elevation: 0,
    mp_description: '',
  });
  const [updated, setUpdated] = useState(new Date());
  const [measurements, setMeasurements] = useState([]);
  const [watlevmp, setWatlevmp] = useState([]);
  const [control, setcontrol] = useState([]);
  const [dynamic, setDynamic] = useState([]);
  const [canEdit] = useState(true);
  const [severity, setSeverity] = useState('success');
  const [severityDel, setSeverityDel] = useState('success');
  const [openAlert, setOpenAlert] = useState(false);
  const [openDelAlert, setOpenDelAlert] = useState(false);

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
    if (boreholeno !== -1 && boreholeno !== null && intakeno !== -1 && intakeno !== null) {
      //let sessionId = sessionStorage.getItem('session_id');
      const mp = getBoreholeMP(boreholeno, intakeno);
      const meas = getOurWaterlevel(boreholeno, intakeno);
      Promise.all([mp, meas]).then((responses) => {
        const measures = responses[1].data.result;
        const mps = responses[0].data.result;
        setMeasurements(measures);
        setWatlevmp(mps);

        if (mps.length > 0) {
          setcontrol(
            measures.map((e) => {
              const elev = mps.filter((e2) => {
                return (
                  moment(e.timeofmeas) >= moment(e2.startdate) &&
                  moment(e.timeofmeas) < moment(e2.enddate)
                );
              })[0].elevation;

              return {
                ...e,
                waterlevel: e.disttowatertable_m ? elev - e.disttowatertable_m : null,
              };
            })
          );
        } else {
          setcontrol(
            measures.map((elem) => {
              return {...elem, waterlevel: elem.disttowatertable_m};
            })
          );
        }
      });
    }
  }, [updated, boreholeno, intakeno]);

  const changePejlingData = (field, value) => {
    setPejlingData({
      ...pejlingData,
      [field]: value,
    });
  };

  const resetPejlingData = () => {
    setPejlingData({
      gid: -1,
      timeofmeas: formatedTimestamp(new Date()),
      pumpstop: formatedTimestamp(new Date()),
      disttowatertable_m: 0,
      comment: '',
      service: false,
    });
    setFormToShow(null);
  };

  const changeMpData = (field, value) => {
    setMpData({
      ...mpData,
      [field]: value,
    });
  };

  const resetMpData = () => {
    setMpData({
      gid: -1,
      startdate: formatedTimestamp(new Date()),
      enddate: formatedTimestamp(new Date('2099-01-01')),
      elevation: 0,
      mp_description: '',
    });

    setFormToShow('ADDMAALEPUNKT');
  };

  const handleMpCancel = () => {
    resetMpData();
    setFormToShow(null);
  };

  const handlePejlingSubmit = () => {
    setFormToShow(null);
    const method = pejlingData.gid !== -1 ? updateMeasurement : insertMeasurement;
    const userId = sessionStorage.getItem('user');
    const payload = {...pejlingData, userid: userId};
    console.log(payload);
    var _date = Date.parse(payload.timeofmeas);
    var _datePumpStop = Date.parse(payload.pumpstop);
    console.log('time before parse: ', payload.timeofmeas);
    console.log('time after parse: ', _date);
    payload.timeofmeas = formatedTimestamp(new Date(_date));
    payload.pumpstop = formatedTimestamp(new Date(_datePumpStop));
    if (payload.service) payload.pumpstop = null;
    method(boreholeno, intakeno, payload)
      .then((res) => {
        resetPejlingData();
        setUpdated(new Date());
        setSeverity('success');
        setTimeout(() => {
          handleClickOpen();
        }, 500);
      })
      .catch((error) => {
        setSeverity('error');
        setOpenAlert(true);
      });
  };

  const handleMpSubmit = () => {
    setFormToShow('ADDMAALEPUNKT');
    const method = mpData.gid !== -1 ? updateMp : insertMp;
    const userId = sessionStorage.getItem('user');
    const payload = {...mpData, userid: userId};
    var _date = Date.parse(payload.startdate);
    console.log('time before parse: ', payload.startdate);
    console.log('time after parse: ', _date);
    payload.startdate = formatedTimestamp(new Date(_date));
    payload.enddate = formatedTimestamp(new Date(Date.parse(payload.enddate)));
    method(boreholeno, intakeno, payload)
      .then((res) => {
        resetMpData();
        setUpdated(new Date());
        setSeverity('success');
        setTimeout(() => {
          handleClickOpen();
        }, 500);
      })
      .catch((error) => {
        setSeverity('error');
        setOpenAlert(true);
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
        deleteMP(boreholeno, intakeno, gid)
          .then((res) => {
            resetMpData();
            setUpdated(new Date());
            setSeverityDel('success');
            setOpenDelAlert(true);
          })
          .catch((error) => {
            setSeverityDel('error');
            setOpenDelAlert(true);
          });
      };
    } else {
      return (gid) => {
        deleteMeasurement(boreholeno, intakeno, gid)
          .then((res) => {
            resetPejlingData();
            setUpdated(new Date());
            setSeverityDel('success');
            setOpenDelAlert(true);
          })
          .catch((error) => {
            setSeverityDel('error');
            setOpenDelAlert(true);
          });
      };
    }
  };

  const handleCloseSnack = (reason) => {
    if (reason === 'clickaway') {
      return;
    }
    setOpenAlert(false);
  };

  const handleClickOpen = () => {
    setOpenAlert(true);
  };

  function Alert(props) {
    return <MuiAlert elevation={6} variant="filled" {...props} />;
  }

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
          setShowForm={setShowForm}
          formData={pejlingData}
          changeFormData={changePejlingData}
          handleSubmit={handlePejlingSubmit}
          resetFormData={resetPejlingData}
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
            setShowForm={setShowForm}
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
      {formToShow === 'CAMERA' && <BoreholeImages boreholeno={location.pathname.split('/')[2]} />}
      <ActionArea
        open={open}
        boreholeno={boreholeno}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
      />
      <Snackbar open={openAlert || openDelAlert} autoHideDuration={4000} onClose={handleCloseSnack}>
        {openAlert === true ? (
          <Alert onClose={handleCloseSnack} severity={severity}>
            {severity === 'success' ? 'Indberetningen lykkedes' : 'Indberetningen fejlede'}
          </Alert>
        ) : (
          <Alert onClose={handleCloseSnack} severity={severityDel}>
            {severityDel === 'success' ? 'Sletningen lykkedes' : 'Sletningen fejlede'}
          </Alert>
        )}
      </Snackbar>
    </div>
  );
};

export default Boreholeno;
