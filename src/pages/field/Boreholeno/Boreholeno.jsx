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
  deleteMP,
} from '../boreholeAPI';
import moment from 'moment';
import BoreholeImages from './BoreholeImages';
import {toast} from 'react-toastify';
import useFormData from '../../../hooks/useFormData';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Button, Box, Grid} from '@mui/material';
import LastJupiterMP from './components/LastJupiterMP';
import {apiClient} from 'src/apiClient';
import BoreholeStamdata from './BoreholeStamdata';

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
  const [addMPOpen, setAddMPOpen] = useState(false);

  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: formatedTimestamp(new Date()),
    pumpstop: null,
    disttowatertable_m: 0,
    service: false,
    comment: '',
    extrema: null,
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

  const [control, setcontrol] = useState([]);
  const [dynamic, setDynamic] = useState([]);
  const [canEdit] = useState(true);

  const {data: measurements} = useQuery(
    ['measurements', boreholeno, intakeno],
    async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    {
      enabled: boreholeno !== -1 && boreholeno !== null && intakeno !== undefined,
      placeholderData: [],
    }
  );

  const {data: stamdata} = useQuery(
    ['borehole_stamdata', boreholeno, intakeno],
    () => {
      return {
        local_number: 'Brabrand_1',
        borehole_description: 'Aarhus Kommune',
        borehole_type: 1,
        intake_description: 'Brabrand_1',
      };
    },
    {
      refetchOnWindowFocus: false,
      refetchOnReconnect: false,
      refetchInterval: false,
    }
  );

  const {data: watlevmp} = useQuery(
    ['watlevmp', boreholeno, intakeno],
    async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    {
      enabled: boreholeno !== -1 && boreholeno !== null && intakeno !== undefined,
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
      })[0]?.elevation;

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
      ctrls = measurements?.map((elem) => {
        return {...elem, waterlevel: elem.disttowatertable_m};
      });
    }
    setcontrol(ctrls);
  }, [watlevmp, measurements]);

  const handleMpCancel = () => {
    resetMpData();
    setAddMPOpen(false);
  };

  const openAddMP = () => {
    setFormToShow('ADDMAALEPUNKT');
    setAddMPOpen(true);
  };

  const addOrEditPejling = useMutation(async (data) => {
    if (data.gid === -1) {
      await apiClient.post(`/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`, data);
    } else {
      await apiClient.put(`/sensor_field/borehole/measurements/${data.gid}`, data);
    }
  });

  const handlePejlingSubmit = () => {
    let payload = {...pejlingData};
    if (payload.service) payload.pumpstop = null;
    addOrEditPejling.mutate(payload, {
      onSuccess: (data) => {
        resetPejlingData();
        setFormToShow(null);
        toast.success('Kontrolmåling gemt');
        queryClient.invalidateQueries(['measurements', boreholeno]);
      },
      onError: (error) => {
        toast.error('Kontrolmåling kunne ikke gemmes');
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
    setAddMPOpen(false);
  };

  const handleEdit = (type) => {
    if (type === 'watlevmp') {
      return (data) => {
        data.startdate = data.startdate.replace(' ', 'T').substr(0, 19);
        data.enddate = data.enddate.replace(' ', 'T').substr(0, 19);
        setMpData(data); // Fill form data on Edit
        setFormToShow('ADDMAALEPUNKT'); // update to use state machine
        setAddMPOpen(true);
      };
    } else {
      return (data) => {
        console.log(data);
        data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
        setPejlingData(data); // Fill form data on Edit
        setFormToShow('ADDPEJLING'); // update to use state machine
      };
    }
  };

  const handleDelete = (type) => {
    if (type === 'watlevmp') {
      return (gid) => {
        deleteMP(boreholeno, intakeno, gid).then((res) => {
          queryClient.invalidateQueries(['watlevmp', boreholeno]);
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid) => {
        deleteMeasurement(boreholeno, intakeno, gid).then((res) => {
          queryClient.invalidateQueries(['measurements', boreholeno]);
          resetPejlingData();
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
          measurements={control}
          dynamicMeasurement={formToShow !== 'ADDPEJLING' ? undefined : dynamic}
        />
      )}
      {formToShow === 'ADDPEJLING' && (
        <PejlingFormBorehole
          formData={pejlingData}
          changeFormData={changePejlingData}
          handleSubmit={handlePejlingSubmit}
          openAddMP={openAddMP}
          resetFormData={() => {
            resetPejlingData();
            setFormToShow(null);
          }}
          mpData={watlevmp}
          stamdata={stamdata}
          lastMeasurementPump={
            measurements?.[0]?.pumpstop || measurements?.[0]?.service ? true : false
          }
        />
      )}
      {formToShow === 'ADDMAALEPUNKT' && (
        <>
          <Grid container spacing={2}>
            <Grid
              item
              xs={12}
              sx={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <LastJupiterMP
                boreholeno={boreholeno}
                intakeno={intakeno}
                lastOurMP={watlevmp?.[0]}
                watlevmpMutate={watlevmpMutate}
              />
            </Grid>
          </Grid>
          {addMPOpen && (
            <MaalepunktForm
              formData={mpData}
              changeFormData={changeMpData}
              handleSubmit={handleMpSubmit}
              resetFormData={resetMpData}
              handleCancel={handleMpCancel}
              canEdit={canEdit}
            />
          )}
          <Box p={2}>
            <Button
              variant="contained"
              color="secondary"
              onClick={() => {
                setAddMPOpen(true);
              }}
            >
              Indberet målepunkt
            </Button>
          </Box>
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
          boreholeno={boreholeno}
          intakeno={intakeno}
          measurements={measurements}
          handleEdit={handleEdit('pejling')}
          handleDelete={handleDelete('pejling')}
          canEdit={canEdit}
        />
      )}
      {formToShow === 'CAMERA' && <BoreholeImages boreholeno={boreholeno} />}
      {formToShow === 'STAMDATA' && (
        <BoreholeStamdata boreholeno={boreholeno} intakeno={intakeno} stamdata={stamdata} />
      )}
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
