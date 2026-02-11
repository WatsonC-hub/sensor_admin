import {AddAPhotoRounded, AddCircle} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import {useMutation, useQuery, useQueryClient} from '@tanstack/react-query';
import dayjs, {Dayjs} from 'dayjs';
import React, {ChangeEvent, useEffect, useRef, useState} from 'react';
import {toast} from 'react-toastify';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import Images from '~/components/Images';
import MaalepunktForm from '~/components/MaalepunktForm';
import SaveImageDialog from '~/components/SaveImageDialog';
import usePermissions from '~/features/permissions/api/usePermissions';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {stationPages} from '~/helpers/EnumHelper';
import {queryKeys} from '~/helpers/QueryKeyFactoryHelper';
import useFormData from '~/hooks/useFormData';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import PlotGraph from '~/pages/field/boreholeno/BoreholeGraph';
import BoreholeStamdata from '~/pages/field/boreholeno/BoreholeStamdata';
import LastJupiterMP from '~/pages/field/boreholeno/components/LastJupiterMP';
import PejlingFormBorehole from '~/pages/field/boreholeno/components/PejlingFormBorehole';
import MaalepunktTable from '~/pages/field/boreholeno/MaalepunktTable';
import PejlingMeasurements from '~/pages/field/boreholeno/PejlingMeasurements';
import {useAppContext} from '~/state/contexts';
import {
  Kontrol,
  MaalepunktPost,
  BoreholeMeasurement,
  BoreholeMeasurementAPI,
  MaalepunktTableData,
} from '~/types';

const dateUpdated = () => {
  return dayjs();
};

const endDateUpdated = () => {
  return dayjs('2099-01-01');
};

type BoreholePejling = {
  gid: number;
  timeofmeas: Dayjs;
  pumpstop: null | Dayjs;
  disttowatertable_m: number;
  service: boolean;
  comment: string;
  extrema: string | null;
};

export type BoreholeMaalepunkt = {
  gid: number;
  startdate: Dayjs;
  enddate: Dayjs;
  elevation: number | null;
  mp_description: string;
};

export type OmittedKontrol = Omit<
  Kontrol,
  'useforcorrection' | 'organisationid' | 'organisationname' | 'uploaded_status' | 'display_name'
>;

const Boreholeno = () => {
  const {boreholeno, intakeno} = useAppContext(['boreholeno'], ['intakeno']);
  const queryClient = useQueryClient();
  const [showForm, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();

  const {
    borehole_permission_query: {data: permissions},
  } = usePermissions();

  const [pejlingData, setPejlingData, changePejlingData, resetPejlingData] =
    useFormData<OmittedKontrol>({
      gid: -1,
      timeofmeas: dateUpdated(),
      pumpstop: null,
      disttowatertable_m: 0,
      service: false,
      comment: '',
      extrema: null,
    });

  const fileInputRef = useRef<HTMLInputElement>(null);
  const [dataUri, setdataUri] = useState<string | ArrayBuffer | null>('');
  const [openSave, setOpenSave] = useState(false);
  const [activeImage, setActiveImage] = useState({
    gid: -1,
    type: boreholeno,
    comment: '',
    public: false,
    date: dayjs(),
  });

  const [mpData, setMpData, changeMpData, resetMpData] = useFormData<BoreholeMaalepunkt>({
    gid: -1,
    startdate: dateUpdated(),
    enddate: endDateUpdated(),
    elevation: null,
    mp_description: '',
  });

  const [control, setcontrol] = useState<Array<BoreholeMeasurement> | undefined>();
  const [dynamic, setDynamic] = useState<{date: string; measurement: number} | null>(null);

  const {data: measurements} = useQuery({
    queryKey: queryKeys.Borehole.measurementsWithIntake(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<BoreholeMeasurementAPI>>(
        `/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`
      );
      return data.map((e) => ({
        ...e,
        timeofmeas: dayjs(e.timeofmeas),
        pumpstop: e.pumpstop ? dayjs(e.pumpstop) : null,
      }));
    },

    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
    placeholderData: [],
  });

  const {data: watlevmp} = useQuery({
    queryKey: queryKeys.Borehole.watlevmpWithIntake(boreholeno, intakeno),
    queryFn: async () => {
      const {data} = await apiClient.get<Array<MaalepunktTableData>>(
        `/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined && boreholeno !== null && intakeno !== undefined,
    placeholderData: [],
  });

  useEffect(() => {
    if (watlevmp && watlevmp.length > 0) {
      const elev: number = watlevmp.filter((e2) => {
        return (
          pejlingData.timeofmeas.isSameOrAfter(e2.startdate) &&
          pejlingData.timeofmeas.isSameOrBefore(e2.enddate)
        );
      })[0]?.elevation;

      const dynamicDate = pejlingData.timeofmeas.format('YYYY-MM-DD HH:mm:ss');
      const dynamicMeas: number = elev - pejlingData.disttowatertable_m;
      setDynamic({date: dynamicDate, measurement: dynamicMeas});
    }
  }, [pejlingData, watlevmp]);

  useEffect(() => {
    let ctrls = [];
    if (measurements !== undefined) {
      if (watlevmp && watlevmp.length > 0) {
        ctrls = measurements?.map((e) => {
          const elev = watlevmp.filter((e2) => {
            return (
              e.timeofmeas.isSameOrAfter(e2.startdate) && e.timeofmeas.isSameOrBefore(e2.enddate)
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
    }
  }, [watlevmp, measurements !== undefined]);

  const handleMpCancel = () => {
    resetMpData();
    setShowForm(null);
  };

  const openAddMP = () => {
    setPageToShow('målepunkt');
    setShowForm(true);
  };

  const addOrEditPejling = useMutation({
    mutationFn: async (data: Kontrol) => {
      if (data.gid === -1) {
        await apiClient.post(`/sensor_field/borehole/measurements/${boreholeno}/${intakeno}`, data);
      } else {
        await apiClient.put(`/sensor_field/borehole/measurements/${data.gid}`, data);
      }
    },
    meta: {
      invalidates: [['measurements']],
    },
  });

  const handlePejlingSubmit = () => {
    const payload = {...pejlingData} as Kontrol;
    if (payload.service) payload.pumpstop = null;
    addOrEditPejling.mutate(payload, {
      onSuccess: () => {
        resetPejlingData();
        setPageToShow('pejling');
        setShowForm(null);
        toast.success('Kontrolmåling gemt');
      },
      onError: () => {
        toast.error('Kontrolmåling kunne ikke gemmes');
      },
    });
  };
  const addOrEditWatlevmp = useMutation({
    mutationFn: async (data: MaalepunktPost) => {
      if (data.gid === -1) {
        await apiClient.post(`/sensor_field/borehole/watlevmp/${boreholeno}/${intakeno}`, data);
      } else {
        await apiClient.put(`/sensor_field/borehole/watlevmp/${data.gid}`, data);
      }
    },
    meta: {
      invalidates: [['borehole_watlevmp']],
    },
  });

  const handleMpSubmit = () => {
    const payload = {...mpData};
    addOrEditWatlevmp.mutate(payload, {
      onSuccess: () => {
        resetMpData();
        setShowForm(null);
        toast.success('Målepunkt gemt');
      },
      onError: () => {
        toast.error('Der skete en fejl');
      },
    });
  };

  const handleEditPejling = (data: Kontrol) => {
    setShowForm(true);
    setPejlingData(data as BoreholePejling);
  };

  const handleEditWatlevmp = (data: BoreholeMaalepunkt) => {
    setShowForm(true);
    setMpData(data as BoreholeMaalepunkt);
  };

  const handleDelete = (type: string) => {
    if (type === 'watlevmp') {
      return (gid: number) => {
        apiClient.delete(`/sensor_field/borehole/watlevmp/${gid}`).then(() => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.Borehole.watlevmp(boreholeno),
          });
          resetMpData();
          toast.success('Målepunkt slettet');
        });
      };
    } else {
      return (gid: number) => {
        apiClient.delete(`/sensor_field/borehole/measurements/${gid}`).then(() => {
          queryClient.invalidateQueries({
            queryKey: queryKeys.Borehole.measurements(boreholeno),
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

  const convertBase64 = async (file: File) => {
    return new Promise((resolve, reject) => {
      const fileReader = new FileReader();
      fileReader.readAsDataURL(file);
      fileReader.onload = () => {
        resolve(fileReader.result);
      };
      fileReader.onerror = (error) => {
        reject(error);
      };
    }) as Promise<string | ArrayBuffer | null>;
  };

  const handleSetDataURI = (datauri: string | ArrayBuffer | null) => {
    setdataUri(datauri);
    setActiveImage({
      gid: -1,
      type: boreholeno,
      comment: '',
      public: false,
      date: dayjs(),
    });
    setOpenSave(true);
  };

  const handleFileRead = async (event: ChangeEvent<HTMLInputElement>) => {
    setShowForm(true);
    const fileList = event.target.files;
    if (event && fileList) {
      const base64 = await convertBase64(fileList[0]);
      handleSetDataURI(base64);
    }
  };

  const handleFileInputClick = () => {
    if (openSave !== true && fileInputRef.current && 'value' in fileInputRef.current)
      fileInputRef.current.value = '';
  };

  if (!intakeno) return '';

  return (
    <>
      {pageToShow !== stationPages.BILLEDER && pageToShow !== stationPages.STAMDATA && (
        <Box
          display={'flex'}
          flexDirection={'column'}
          gap={5}
          sx={{marginBottom: 0.5, marginTop: 0.2}}
        >
          <PlotGraph
            ourData={control ?? []}
            dynamicMeasurement={pageToShow === 'pejling' && showForm ? dynamic : null}
          />
          <Divider />
        </Box>
      )}

      {pageToShow === stationPages.PEJLING && (
        <StationPageBoxLayout>
          {showForm === true && (
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
          <PejlingMeasurements
            measurements={measurements}
            handleEdit={handleEditPejling}
            handleDelete={handleDelete('pejling')}
          />
          <FabWrapper
            icon={<AddCircle />}
            text="Tilføj pejling"
            onClick={() => {
              resetPejlingData();
              setShowForm(true);
            }}
            disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
            sx={{
              visibility:
                pageToShow === stationPages.PEJLING && showForm === null ? 'visible' : 'hidden',
            }}
          />
        </StationPageBoxLayout>
      )}
      {pageToShow === stationPages.MAALEPUNKT && (
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
            lastOurMP={watlevmp?.[0]}
            watlevmpMutate={addOrEditWatlevmp}
            setAddMPOpen={setShowForm}
          />

          {showForm && (
            <MaalepunktForm
              formData={mpData}
              changeFormData={changeMpData}
              handleSubmit={handleMpSubmit}
              handleCancel={handleMpCancel}
            />
          )}
        </Box>
      )}
      {pageToShow === stationPages.MAALEPUNKT && (
        <StationPageBoxLayout>
          <MaalepunktTable
            watlevmp={watlevmp}
            handleEdit={handleEditWatlevmp}
            handleDelete={handleDelete('watlevmp')}
          />
          <FabWrapper
            icon={<AddCircle />}
            text="Tilføj målepunkt"
            onClick={() => {
              setShowForm(true);
              resetMpData();
            }}
            disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
            sx={{
              visibility: pageToShow === 'målepunkt' && showForm === null ? 'visible' : 'hidden',
            }}
          />
        </StationPageBoxLayout>
      )}

      {pageToShow === stationPages.STAMDATA && <BoreholeStamdata />}

      {pageToShow === stationPages.BILLEDER && (
        <StationPageBoxLayout>
          <Images
            type={'borehole'}
            typeId={boreholeno}
            setOpenSave={setOpenSave}
            setActiveImage={setActiveImage}
            setShowForm={setShowForm}
          />
          <FabWrapper
            icon={<AddAPhotoRounded />}
            text="Tilføj billede"
            disabled={!permissions?.borehole_plantids?.boreholenos?.includes(boreholeno)}
            onClick={() => {
              if (fileInputRef.current) fileInputRef.current.click();
            }}
            sx={{
              bottom: 70,
            }}
          />
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
        </StationPageBoxLayout>
      )}
      <input
        type="file"
        ref={fileInputRef}
        style={{display: 'none'}}
        onChange={handleFileRead}
        onClick={handleFileInputClick}
      />
    </>
  );
};

export default Boreholeno;
