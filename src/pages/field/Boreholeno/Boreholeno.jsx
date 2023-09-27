import React, {useEffect, useState} from 'react';
import ActionAreaBorehole from './ActionAreaBorehole';
import BearingGraph from './BearingGraph';
import PejlingFormBorehole from './components/PejlingFormBorehole';
import PejlingMeasurements from './PejlingMeasurements';
import MaalepunktForm from '../../../components/MaalepunktForm';
import {useLocation, useNavigate, useParams} from 'react-router-dom';
import MaalepunktTable from './MaalepunktTable';
import moment from 'moment';
import BoreholeImages from './BoreholeImages';
import {toast} from 'react-toastify';
import useFormData from '../../../hooks/useFormData';
import {useQuery, useMutation, useQueryClient} from '@tanstack/react-query';
import {Button, Box, Grid} from '@mui/material';
import LastJupiterMP from './components/LastJupiterMP';
import {apiClient} from 'src/apiClient';
import BoreholeStamdata from './BoreholeStamdata';

const Boreholeno = ({boreholeno, intakeno}) => {
  let location = useLocation();
  let navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addMPOpen, setAddMPOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const {data: permissions} = useQuery(['borehole_permissions'], async () => {
    const {data} = await apiClient.get(`/auth/me/permissions`);
    return data;
  });

  useEffect(() => {
    if (permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)) {
      setCanEdit(true);
    }
  }, [permissions]);

  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] = useFormData({
    gid: -1,
    timeofmeas: new Date(),
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
    startdate: new Date(),
    enddate: new Date('2099-01-01'),
    elevation: 0,
    mp_description: '',
  });

  const [control, setcontrol] = useState([]);
  const [dynamic, setDynamic] = useState([]);

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
    async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/stamdata/${boreholeno}/${intakeno}`
      );
      return data;
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

  const addOrEditWatlevmp = useMutation(async (data) => {
    if (data.gid === -1) {
      await apiClient.post(`/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`, data);
    } else {
      await apiClient.put(`/sensor_field/borehole/watlevmp/${data.gid}`, data);
    }
  });

  const handleMpSubmit = () => {
    let payload = {...mpData};
    console.log(payload);
    addOrEditWatlevmp.mutate(payload, {
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
        data.startdate = moment(data.startdate).format('YYYY-MM-DDTHH:mm');
        data.enddate = moment(data.enddate).format('YYYY-MM-DDTHH:mm');
        setMpData(data); // Fill form data on Edit
        setFormToShow('ADDMAALEPUNKT'); // update to use state machine
        setAddMPOpen(true);
      };
    } else {
      return (data) => {
        console.log(data);
        data.timeofmeas = moment(data.timeofmeas).format('YYYY-MM-DDTHH:mm');
        setPejlingData(data); // Fill form data on Edit
        setFormToShow('ADDPEJLING'); // update to use state machine
      };
    }
  };

  const handleDelete = (type) => {
    if (type === 'watlevmp') {
      return (gid) => {
        apiClient.delete(`/sensor_field/borehole/watlevmp/${gid}`).then((res) => {
          queryClient.invalidateQueries(['watlevmp', boreholeno]);
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid) => {
        apiClient.delete(`/sensor_field/borehole/measurements/${gid}`).then((res) => {
          queryClient.invalidateQueries(['measurements', boreholeno]);
          resetPejlingData();
          toast.success('Kontrolmåling slettet');
        });
      };
    }
  };

  return (
    <>
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
                watlevmpMutate={addOrEditWatlevmp}
                setAddMPOpen={setAddMPOpen}
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
              canEdit={true}
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
            canEdit={true}
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
          canEdit={true}
        />
      )}
      {formToShow === 'CAMERA' && <BoreholeImages boreholeno={boreholeno} />}
      {formToShow === 'STAMDATA' && canEdit && (
        <BoreholeStamdata
          boreholeno={boreholeno}
          intakeno={intakeno}
          stamdata={stamdata}
          setFormToShow={setFormToShow}
        />
      )}
      <ActionAreaBorehole
        open={open}
        boreholeno={boreholeno}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
      />
    </>
  );
};

export default Boreholeno;
