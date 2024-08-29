import {AddAPhotoRounded, AddCircle} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import {StationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useSearchParam} from '~/hooks/useSeachParam';

import MaalepunktForm from '../../../components/MaalepunktForm';
import SaveImageDialog from '../../../components/SaveImageDialog';
import useFormData from '../../../hooks/useFormData';

import ActionAreaBorehole from './ActionAreaBorehole';
import BearingGraph from './BearingGraph';
import BoreholeStamdata from './BoreholeStamdata';
import LastJupiterMP from './components/LastJupiterMP';
import PejlingFormBorehole from './components/PejlingFormBorehole';
import MaalepunktTable from './MaalepunktTable';
import PejlingMeasurements from './PejlingMeasurements';

const Boreholeno = ({boreholeno, intakeno}) => {
  const queryClient = useQueryClient();
  const [canEdit, setCanEdit] = useState(false);
  const [showForm, setShowForm] = useSearchParam('showForm');
  const [pageToShow, setPageToShow] = useSearchParam('page', null);
  const {isMobile} = useBreakpoints();
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
    timeofmeas: () => moment().format('YYYY-MM-DDTHH:mm'),
    pumpstop: null,
    disttowatertable_m: 0,
    service: false,
    comment: '',
    extrema: null,
  });

  const fileInputRef = useRef(null);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: boreholeno,
    comment: '',
    public: false,
    date: () => moment().format('YYYY-MM-DDTHH:mm'),
  });

  console.log(boreholeno, intakeno);

  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: () => moment().format('YYYY-MM-DDTHH:mm'),
    enddate: () => moment('2099-01-01').format('YYYY-MM-DDTHH:mm'),
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
    setShowForm(null);
  };

  const openAddMP = () => {
    setPageToShow(StationPages.MAALEPUNKT);
    setShowForm('true');
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
      onSuccess: () => {
        resetPejlingData();
        setPageToShow(StationPages.PEJLING);
        setShowForm(null);
        toast.success('Kontrolmåling gemt');
        queryClient.invalidateQueries({
          queryKey: ['measurements', boreholeno],
        });
      },
      onError: () => {
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
      onSuccess: () => {
        resetMpData();
        setShowForm(null);
        toast.success('Målepunkt gemt');
        queryClient.invalidateQueries({
          queryKey: ['watlevmp', boreholeno],
        });
      },
      onError: () => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const handleEdit = (type) => {
    if (type === 'watlevmp') {
      return (data) => {
        data.startdate = moment(data.startdate).format('YYYY-MM-DDTHH:mm');
        data.enddate = moment(data.enddate).format('YYYY-MM-DDTHH:mm');
        setMpData(data); // Fill form data on Edit
        setShowForm('true'); // update to use state machine¨
      };
    } else {
      return (data) => {
        data.timeofmeas = moment(data.timeofmeas).format('YYYY-MM-DDTHH:mm');
        setPejlingData(data); // Fill form data on Edit
        setShowForm('true'); // update to use state machine¨
      };
    }
  };

  const handleDelete = (type) => {
    if (type === 'watlevmp') {
      return (gid) => {
        apiClient.delete(`/sensor_field/borehole/watlevmp/${gid}`).then(() => {
          queryClient.invalidateQueries({
            queryKey: ['watlevmp', boreholeno],
          });
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid) => {
        apiClient.delete(`/sensor_field/borehole/measurements/${gid}`).then(() => {
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
    setShowForm('true');
    const file = event.target.files[0];
    const base64 = await convertBase64(file);
    handleSetDataURI(base64);
  };

  const handleFileInputClick = () => {
    // Reset the file input value to allow re-triggering the change event
    fileInputRef.current.value = null;
  };

  return (
    <Box display="flex" height={'max-content'} flexDirection={'column'}>
      {pageToShow !== StationPages.BILLEDER && pageToShow !== StationPages.STAMDATA && (
        <Box>
          <BearingGraph
            boreholeno={boreholeno}
            intakeno={intakeno}
            measurements={control}
            dynamicMeasurement={
              pageToShow === StationPages.PEJLING && showForm === 'true' ? dynamic : undefined
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
          alignSelf: isMobile ? '' : 'center',
        }}
      >
        {pageToShow === StationPages.PEJLING && showForm === 'true' && (
          <PejlingFormBorehole
            formData={pejlingData}
            changeFormData={changePejlingData}
            handleSubmit={handlePejlingSubmit}
            openAddMP={openAddMP}
            resetFormData={() => {
              resetPejlingData();
              setShowForm(null);
            }}
            mpData={watlevmp}
            stamdata={stamdata}
            lastMeasurementPump={
              measurements?.[0]?.pumpstop || measurements?.[0]?.service ? true : false
            }
          />
        )}
        {pageToShow === StationPages.MAALEPUNKT && (
          <Box
            sx={{
              display: 'flex',
              flexDirection: 'column',
              flexWrap: 'wrap',
              alignContent: 'center',
              alignItems: 'center',
              justifyContent: 'center',
            }}
            gap={1}
          >
            <LastJupiterMP
              boreholeno={boreholeno}
              intakeno={intakeno}
              lastOurMP={watlevmp?.[0]}
              watlevmpMutate={addOrEditWatlevmp}
              setAddMPOpen={setShowForm}
            />

            {showForm === 'true' && (
              <MaalepunktForm
                formData={mpData}
                changeFormData={changeMpData}
                handleSubmit={handleMpSubmit}
                resetFormData={resetMpData}
                handleCancel={handleMpCancel}
                canEdit={true}
              />
            )}
          </Box>
        )}
        {pageToShow === StationPages.MAALEPUNKT && (
          <FabWrapper
            icon={<AddCircle />}
            text="Tilføj målepunkt"
            onClick={() => {
              setShowForm('true');
              resetMpData();
            }}
            visible={
              pageToShow === StationPages.MAALEPUNKT && showForm === null ? 'visible' : 'hidden'
            }
          >
            <MaalepunktTable
              watlevmp={watlevmp}
              handleEdit={handleEdit('watlevmp')}
              handleDelete={handleDelete('watlevmp')}
              canEdit={true}
            />
          </FabWrapper>
        )}
        {pageToShow === null && (
          <FabWrapper
            icon={<AddCircle />}
            text="Tilføj pejling"
            onClick={() => {
              resetPejlingData();
              setShowForm('true');
            }}
            visible={
              pageToShow === StationPages.PEJLING && showForm === null ? 'visible' : 'hidden'
            }
          >
            <PejlingMeasurements
              boreholeno={boreholeno}
              intakeno={intakeno}
              measurements={measurements}
              handleEdit={handleEdit('pejling')}
              handleDelete={handleDelete('pejling')}
              canEdit={true}
            />
          </FabWrapper>
        )}
        {pageToShow === StationPages.BILLEDER && (
          <FabWrapper
            icon={<AddAPhotoRounded />}
            text="Tilføj billede"
            onClick={() => {
              fileInputRef.current.click();
            }}
          >
            <Images
              type={'borehole'}
              typeId={boreholeno}
              setOpenSave={setOpenSave}
              setActiveImage={setActiveImage}
              setShowForm={setShowForm}
            />
          </FabWrapper>
        )}
        {pageToShow === StationPages.BILLEDER && (
          <div>
            <SaveImageDialog
              activeImage={activeImage}
              changeData={changeActiveImageData}
              id={boreholeno}
              type={'borehole'}
              open={openSave}
              dataUri={dataUri}
              handleCloseSave={() => {
                setOpenSave(false);
                setdataUri('');
                setShowForm(null);
              }}
            />
          </div>
        )}
        <input
          type="file"
          ref={fileInputRef}
          style={{display: 'none'}}
          onChange={handleFileRead}
          onClick={handleFileInputClick}
        />
        {pageToShow === StationPages.STAMDATA && canEdit && (
          <BoreholeStamdata boreholeno={boreholeno} intakeno={intakeno} stamdata={stamdata} />
        )}
      </Box>
      <ActionAreaBorehole
        setPageToShow={setPageToShow}
        showForm={showForm}
        setShowForm={setShowForm}
        canEdit={canEdit}
        fileInputRef={fileInputRef}
      />
    </Box>
  );
};

export default Boreholeno;
