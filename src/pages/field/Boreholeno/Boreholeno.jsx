import {Box, Grid} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {useLocation, useNavigate} from 'react-router-dom';
import {toast} from 'react-toastify';
import {apiClient} from '~/apiClient';
import MaalepunktForm from '../../../components/MaalepunktForm';
import useFormData from '../../../hooks/useFormData';
import ActionAreaBorehole from './ActionAreaBorehole';
import BearingGraph from './BearingGraph';
import BoreholeImages from './BoreholeImages';
import BoreholeStamdata from './BoreholeStamdata';
import MaalepunktTable from './MaalepunktTable';
import PejlingMeasurements from './PejlingMeasurements';
import LastJupiterMP from './components/LastJupiterMP';
import PejlingFormBorehole from './components/PejlingFormBorehole';
import SaveImageDialog from '../../../components/SaveImageDialog';
import Button from '~/components/Button'

const Boreholeno = ({boreholeno, intakeno}) => {
  let location = useLocation();
  let navigate = useNavigate();
  const queryClient = useQueryClient();
  const [addMPOpen, setAddMPOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);

  const {data: permissions} = useQuery({
    queryKey: ['borehole_permissions'],
    queryFn: async () => {
      const {data} = await apiClient.get(`/auth/me/permissions`);
      return data;
    },
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

  const [showData, setShowData] = useState('ADDPEJLING')
  const fileInputRef = useRef(null);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: boreholeno,
    comment: '',
    public: false,
    date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
  });


  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: new Date(),
    enddate: new Date('2099-01-01'),
    elevation: 0,
    mp_description: '',
  });

  const [control, setcontrol] = useState([]);
  const [dynamic, setDynamic] = useState([]);

  const {data: measurements} = useQuery({
    queryKey: ['measurements', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== -1 && boreholeno !== null && intakeno !== undefined,
    placeholderData: [],
  });

  const {data: stamdata} = useQuery({
    queryKey: ['borehole_stamdata', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/stamdata/${boreholeno}/${intakeno}`
      );
      return data;
    },
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchInterval: false,
  });

  const {data: watlevmp} = useQuery({
    queryKey: ['watlevmp', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== -1 && boreholeno !== null && intakeno !== undefined,
    placeholderData: [],
  });

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
    setFormToShow('')
    setShowData('ADDMAALEPUNKT')
  };

  const openAddMP = () => {
    setFormToShow('ADDMAALEPUNKT');
    setAddMPOpen(true);
  };

  const addOrEditPejling = useMutation({
    mutationFn: async (data) => {
      if (data.gid === -1) {
        await apiClient.post(`/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`, data);
      } else {
        await apiClient.put(`/sensor_field/borehole/measurements/${data.gid}`, data);
      }
    },
  });

  const handlePejlingSubmit = () => {
    let payload = {...pejlingData};
    if (payload.service) payload.pumpstop = null;
    addOrEditPejling.mutate(payload, {
      onSuccess: (data) => {
        resetPejlingData();
        setFormToShow(null);
        setShowData('ADDPEJLING')
        toast.success('Kontrolmåling gemt');
        queryClient.invalidateQueries({
          queryKey: ['measurements', boreholeno],
        });
      },
      onError: (error) => {
        toast.error('Kontrolmåling kunne ikke gemmes');
      },
    });
  };

  const addOrEditWatlevmp = useMutation({
    mutationFn: async (data) => {
      if (data.gid === -1) {
        await apiClient.post(`/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`, data);
      } else {
        await apiClient.put(`/sensor_field/borehole/watlevmp/${data.gid}`, data);
      }
    },
  });

  const handleMpSubmit = () => {
    let payload = {...mpData};
    addOrEditWatlevmp.mutate(payload, {
      onSuccess: (data) => {
        resetMpData();
        toast.success('Målepunkt gemt');
        queryClient.invalidateQueries({
          queryKey: ['watlevmp', boreholeno],
        });
      },
      onError: (error) => {
        toast.error('Der skete en fejl');
      },
    });
    setAddMPOpen(false);
    setFormToShow('');
    setShowData('ADDMAALEPUNKT');

  };

  const handleEdit = (type) => {
    
    if (type === 'watlevmp') {
      return (data) => {
        data.startdate = moment(data.startdate).format('YYYY-MM-DDTHH:mm');
        data.enddate = moment(data.enddate).format('YYYY-MM-DDTHH:mm');
        setMpData(data); // Fill form data on Edit
        setFormToShow('ADDMAALEPUNKT'); // update to use state machine¨
        setShowData('')
        setAddMPOpen(true);
      };
    } else {
      return (data) => {
        data.timeofmeas = moment(data.timeofmeas).format('YYYY-MM-DDTHH:mm');
        setPejlingData(data); // Fill form data on Edit
        setFormToShow('ADDPEJLING'); // update to use state machine
        setShowData('')
      };
    }
    
  };

  const handleDelete = (type) => {
    if (type === 'watlevmp') {
      return (gid) => {
        apiClient.delete(`/sensor_field/borehole/watlevmp/${gid}`).then((res) => {
          queryClient.invalidateQueries({
            queryKey: ['watlevmp', boreholeno],
          });
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid) => {
        apiClient.delete(`/sensor_field/borehole/measurements/${gid}`).then((res) => {
          queryClient.invalidateQueries({
            queryKey: ['measurements', boreholeno],
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
      type: boreholeno,
      comment: '',
      public: false,
      date: moment(new Date()).format('YYYY-MM-DD HH:mm'),
    });
    setOpenSave(true);
  };

  const handleFileRead = async (event) => {
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    handleSetDataURI(base64);
  };

  const handleFileInputClick = () => {
    // Reset the file input value to allow re-triggering the change event
    fileInputRef.current.value = null;
  };

  return (
    <>
      {showData === 'ADDPEJLING' &&
        <Box sx={{ marginBottom: 5, marginTop: 5 }}>
          {showData !== 'CAMERA' && (
            <BearingGraph
              boreholeno={boreholeno}
              intakeno={intakeno}
              measurements={control}
              dynamicMeasurement={showData !== 'ADDPEJLING' ? undefined : dynamic}
            />
          )}
        </Box>
      }   
      <Box >
        {formToShow === 'ADDPEJLING' && (
          <PejlingFormBorehole
            formData={pejlingData}
            changeFormData={changePejlingData}
            handleSubmit={handlePejlingSubmit}
            openAddMP={openAddMP}
            resetFormData={() => {
              resetPejlingData();
              setFormToShow(null);
              setShowData('ADDPEJLING')
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
                btType="primary"
                onClick={() => {
                  setAddMPOpen(true);
                }}
              >
                Indberet målepunkt
              </Button>
            </Box>
          </>
        )}
        {showData === 'ADDMAALEPUNKT' &&
          <MaalepunktTable
          watlevmp={watlevmp}
          handleEdit={handleEdit('watlevmp')}
          handleDelete={handleDelete('watlevmp')}
          canEdit={true}
          />
        }
        {(showData === null || showData === 'ADDPEJLING') && (
          <PejlingMeasurements
            boreholeno={boreholeno}
            intakeno={intakeno}
            measurements={measurements}
            handleEdit={handleEdit('pejling')}
            handleDelete={handleDelete('pejling')}
            canEdit={true}
          />
        )}
        {showData === 'CAMERA' && <BoreholeImages boreholeno={boreholeno} setOpenSave={setOpenSave} setActiveImage={setActiveImage} setFormToShow={setFormToShow} />}
        {formToShow === 'CAMERA' && 
        <div>
          <SaveImageDialog
            activeImage={activeImage}
            changeData={changeActiveImageData}
            id={boreholeno}
            type={'borehole'}
            open={openSave}
            dataUri={dataUri}
            handleCloseSave={() => {
              setOpenSave(false)
              setdataUri('')
            }}/>
        </div>
      }
        <input
          type="file"
          ref={fileInputRef}
          style={{ display: 'none' }}
          onChange={handleFileRead}
          onClick={handleFileInputClick}
          />
        {showData === 'STAMDATA' && canEdit && (
          <BoreholeStamdata
            boreholeno={boreholeno}
            intakeno={intakeno}
            stamdata={stamdata}
            setFormToShow={setFormToShow}
          />
        )}
      </Box>
      <ActionAreaBorehole
        setShowData={setShowData}
        formToShow={formToShow}
        setFormToShow={setFormToShow}
        canEdit={canEdit}
        fileInputRef={fileInputRef}
      />
    </>
  );
};

export default Boreholeno;
