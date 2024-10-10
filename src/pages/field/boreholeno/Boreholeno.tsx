import {AddAPhotoRounded, AddCircle} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import moment from 'moment';
import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import MaalepunktForm from '~/components/MaalepunktForm';
import SaveImageDialog from '~/components/SaveImageDialog';
import {StationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import useFormData from '~/hooks/useFormData';
import {useSearchParam} from '~/hooks/useSeachParam';
import ActionAreaBorehole from '~/pages/field/boreholeno/ActionAreaBorehole';
import BearingGraph from '~/pages/field/boreholeno/BearingGraph';
import BoreholeStamdata from '~/pages/field/boreholeno/BoreholeStamdata';
import LastJupiterMP from '~/pages/field/boreholeno/components/LastJupiterMP';
import PejlingFormBorehole from '~/pages/field/boreholeno/components/PejlingFormBorehole';
import MaalepunktTable from '~/pages/field/boreholeno/MaalepunktTable';
import PejlingMeasurements from '~/pages/field/boreholeno/PejlingMeasurements';
import {Kontrol, Maalepunkt, MaalepunktPost, MaalepunktTableData, Measurement} from '~/types';

interface boreholenoProps {
  boreholeno: string;
  intakeno: number;
}

const Boreholeno = ({boreholeno, intakeno}: boreholenoProps) => {
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
    enabled: intakeno !== -1,
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

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataUri, setdataUri] = useState('');
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: boreholeno,
    comment: '',
    public: false,
    date: moment().format('YYYY-MM-DDTHH:mm'),
  });

  console.log(intakeno);

  const [mpData, setMpData, changeMpData, resetMpData] = useFormData({
    gid: -1,
    startdate: () => moment().format('YYYY-MM-DDTHH:mm'),
    enddate: () => moment('2099-01-01').format('YYYY-MM-DDTHH:mm'),
    elevation: 0,
    mp_description: '',
  });

  const [control, setcontrol] = useState([]);
  const [dynamic, setDynamic] = useState<Array<string | number>>([]);

  const {data: measurements} = useQuery({
    queryKey: ['measurements', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== '-1' && boreholeno !== null && intakeno !== -1,
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
    enabled: boreholeno !== '-1' && intakeno !== -1,
  });

  const {data: watlevmp} = useQuery({
    queryKey: ['watlevmp', boreholeno, intakeno],
    queryFn: async () => {
      const {data} = await apiClient.get(
        `/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== '-1' && boreholeno !== null && intakeno !== -1,
    placeholderData: [],
  });

  useEffect(() => {
    if (watlevmp.length > 0) {
      const elev: number = watlevmp.filter((e2: Maalepunkt) => {
        return (
          moment(pejlingData.timeofmeas) >= moment(e2.startdate) &&
          moment(pejlingData.timeofmeas) < moment(e2.enddate)
        );
      })[0]?.elevation;

      const dynamicDate: string = pejlingData.timeofmeas;
      const dynamicMeas: number = elev - pejlingData.disttowatertable_m;
      setDynamic([dynamicDate, dynamicMeas]);
    }
  }, [pejlingData, watlevmp]);

  useEffect(() => {
    let ctrls = [];
    if (watlevmp.length > 0) {
      ctrls = measurements.map((e: Measurement) => {
        const elev = watlevmp.filter((e2: Maalepunkt) => {
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
      ctrls = measurements?.map((elem: Measurement) => {
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
    mutationFn: async (data: Kontrol) => {
      if (data.gid === -1) {
        await apiClient.post(`/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`, data);
      } else {
        await apiClient.put(`/sensor_field/borehole/measurements/${data.gid}`, data);
      }
    },
  });

  const handlePejlingSubmit = () => {
    const payload = {...pejlingData};
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
  // infer usemutation type for LASTJUPITERMP.tsx
  const addOrEditWatlevmp = useMutation({
    mutationFn: async (data: MaalepunktPost) => {
      if (data.gid === -1) {
        await apiClient.post(`/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`, data);
      } else {
        await apiClient.put(`/sensor_field/borehole/watlevmp/${data.gid}`, data);
      }
    },
  });

  const handleMpSubmit = () => {
    const payload = {...mpData};
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

  const handleEdit = (type: string) => {
    if (type === 'watlevmp') {
      return (data: MaalepunktTableData) => {
        data.startdate = moment(data.startdate).format('YYYY-MM-DDTHH:mm');
        data.enddate = moment(data.enddate).format('YYYY-MM-DDTHH:mm');
        setMpData(data); // Fill form data on Edit
        setShowForm('true'); // update to use state machine¨
      };
    } else {
      return (data: Kontrol) => {
        data.timeofmeas = moment(data.timeofmeas).format('YYYY-MM-DDTHH:mm');
        setPejlingData(data); // Fill form data on Edit
        setShowForm('true'); // update to use state machine¨
      };
    }
  };

  const handleDelete = (type: string) => {
    if (type === 'watlevmp') {
      return (gid: number) => {
        apiClient.delete(`/sensor_field/borehole/watlevmp/${gid}`).then(() => {
          queryClient.invalidateQueries({
            queryKey: ['watlevmp', boreholeno],
          });
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid: number) => {
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

  const changeActiveImageData = (field: string, value: string) => {
    setActiveImage({
      ...activeImage,
      [field]: value,
    });
  };

  const convertBase64 = async (file: Blob) => {
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

  const handleSetDataURI = (datauri: string) => {
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

  const handleFileRead = async (event: ChangeEvent<HTMLInputElement>) => {
    setShowForm('true');
    const fileList = event.target.files ?? null;
    if (fileList && fileList.length > 0) {
      const base64 = await convertBase64(fileList[0]);
      handleSetDataURI(base64 as string);
    }
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
            resetFormData={() => {
              resetPejlingData();
              setShowForm(null);
            }}
            mpData={watlevmp}
            openAddMP={openAddMP}
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
                handleCancel={handleMpCancel}
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
              handleEdit={() => handleEdit('watlevmp')}
              handleDelete={handleDelete('watlevmp')}
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
              measurements={measurements}
              handleEdit={() => handleEdit('pejling')}
              handleDelete={handleDelete('pejling')}
            />
          </FabWrapper>
        )}
        {pageToShow === StationPages.BILLEDER && (
          <FabWrapper
            icon={<AddAPhotoRounded />}
            text="Tilføj billede"
            onClick={() => {
              fileInputRef.current && fileInputRef.current.click();
            }}
            visible="true"
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
        <input type="file" ref={fileInputRef} style={{display: 'none'}} onChange={handleFileRead} />
        {pageToShow === StationPages.STAMDATA && canEdit && (
          <BoreholeStamdata boreholeno={boreholeno} intakeno={intakeno} stamdata={stamdata} />
        )}
      </Box>
      <ActionAreaBorehole canEdit={canEdit} />
    </Box>
  );
};

export default Boreholeno;
