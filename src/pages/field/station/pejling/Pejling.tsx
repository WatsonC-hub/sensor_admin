import {AddCircle} from '@mui/icons-material';
import {Card, Box, Divider, Typography} from '@mui/material';

import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import {usePejling} from '~/features/pejling/api/usePejling';
import LatestMeasurementTable from '~/features/pejling/components/LatestMeasurementTable';
import usePermissions from '~/features/permissions/api/usePermissions';
import usePejlingForm from '~/features/station/components/pejling/api/usePejlingForm';
import CompoundPejling from '~/features/station/components/pejling/CompoundPejling';
import {
  PejlingBoreholeItem,
  PejlingItem,
} from '~/features/station/components/pejling/PejlingSchema';
import {PejlingItem as PejlingWithId, LatestMeasurement} from '~/types';
import PlotGraph from '~/features/station/components/StationGraph';
import BoreholeGraph from '~/pages/field/boreholeno/BoreholeGraph';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {stationPages} from '~/helpers/EnumHelper';
import {useLocationData, useTimeseriesData} from '~/hooks/query/useMetadata';
import {
  useCreateTabState,
  useShowFormState,
  useStationPages,
} from '~/hooks/useQueryStateParameters';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {useBoreholePejling} from '~/features/pejling/api/useBoreholePejling';
import {Kontrol} from '../../boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import {useSetAtom} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import {boreholeInitialData, initialData} from '~/features/pejling/const';

const Pejling = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const [mode, setMode] = useState<'Add' | 'Edit'>('Add');
  const setIsPump = useSetAtom(boreholeIsPumpAtom);
  const [gid, setGid] = useState<number>(-1);
  const [dynamic, setDynamic] = useState<Array<string | number> | undefined>();
  const {data: location_data} = useLocationData(loc_id);
  const {data: timeseries_data} = useTimeseriesData();
  const [showForm, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const [, setTabValue] = useCreateTabState();
  const {post: postPejling, put: putPejling, del: delPejling} = usePejling();
  const boreholeno = location_data?.boreholeno;
  const intakeno = location_data?.timeseries.find((ts) => ts.ts_id === ts_id)?.intakeno;
  const {
    post: postBorehole,
    put: putBorehole,
    del: delBorehole,
  } = useBoreholePejling(boreholeno, intakeno);

  const {
    feature_permission_query: {data: permissions},
    location_permissions,
  } = usePermissions(loc_id);

  const [formMethods, PejlingForm, Table] = usePejlingForm({
    loctype_id: timeseries_data?.loctype_id,
  });
  const {reset} = formMethods;

  const {
    data: latestMeasurement,
    isError,
    error,
  } = useQuery<LatestMeasurement, APIError>({
    queryKey: ['latest_measurement', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<LatestMeasurement>(
        `/sensor_field/station/latest_measurement/${ts_id}`
      );

      return data;
    },
    staleTime: 10,
    enabled:
      ts_id !== undefined && ts_id !== null && ts_id !== -1 && timeseries_data?.loctype_id !== 9,
  });

  const handlePejlingSubmit = (values: PejlingItem | PejlingBoreholeItem) => {
    if (timeseries_data?.loctype_id !== 9) {
      const pejling = values as PejlingItem;
      const payload = {
        path: `${ts_id}`,
        data: {
          measurement: pejling.measurement,
          timeofmeas: moment(pejling.timeofmeas).toISOString(),
          comment: pejling.comment,
          useforcorrection: pejling.useforcorrection,
        },
      };

      if (mode === 'Add') {
        postPejling.mutate(payload, {
          onSuccess: () => {
            reset();
            setDynamic([]);
            setShowForm(null);
          },
        });
      } else {
        payload.path = gid === -1 ? `${ts_id}` : `${ts_id}/${gid}`;
        putPejling.mutate(payload, {
          onSuccess: () => {
            reset(initialData);
          },
        });
      }
    } else {
      const borehole = values as PejlingBoreholeItem;
      const payload = {
        path: `${boreholeno}/${intakeno}`,
        data: {
          disttowatertable_m: borehole.disttowatertable_m,
          timeofmeas: moment(borehole.timeofmeas).toISOString(),
          comment: borehole.comment,
          useforcorrection: borehole.useforcorrection,
          service: borehole.service,
          pumpstop: borehole.pumpstop,
          extrema: borehole.extrema,
        },
      };

      if (mode === 'Add') {
        postBorehole.mutate(payload, {
          onSuccess: () => {
            reset();
            setDynamic([]);
            setShowForm(null);
            setIsPump(false);
          },
        });
      } else {
        payload.path = `${gid}`;
        putBorehole.mutate(payload, {
          onSuccess: () => {
            reset(boreholeInitialData);
            setIsPump(false);
          },
        });
      }
    }
  };

  const handleEdit = (data: PejlingWithId | Kontrol) => {
    data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
    reset(data);
    setShowForm(true);
    setMode('Edit');
    setGid(data.gid);
  };

  const handleDelete = (gid: number | undefined) => {
    if (timeseries_data?.loctype_id !== 9) {
      const payload = {path: `${ts_id}/${gid}`};
      delPejling.mutate(payload);
    } else {
      const payload = {path: `${gid}`};
      delBorehole.mutate(payload);
    }
  };

  const openAddMP = () => {
    setPageToShow(stationPages.GENERELTUDSTYR);
    setTabValue('udstyr');
    setShowForm(true);
  };

  useEffect(() => {
    setShowForm(null);
    reset(initialData);
    setDynamic([]);
  }, [ts_id]);

  return (
    <>
      <Box>
        {timeseries_data?.loctype_id !== 9 ? (
          <PlotGraph
            key={'pejling' + ts_id}
            dynamicMeasurement={
              pageToShow === stationPages.PEJLING && showForm === true ? dynamic : undefined
            }
          />
        ) : (
          <BoreholeGraph
            dynamicMeasurement={pageToShow === 'pejling' && showForm ? dynamic : undefined}
          />
        )}
      </Box>
      <Divider />
      <StationPageBoxLayout>
        <LatestMeasurementTable
          latestMeasurement={latestMeasurement}
          errorMessage={
            isError && typeof error?.response?.data.detail == 'string'
              ? error?.response?.data.detail
              : undefined
          }
        />
        <FormProvider {...formMethods}>
          {showForm === true && (
            <Card
              sx={{
                marginLeft: {xs: '0%'},
                mb: 3,
                padding: 2,
                borderRadius: 2.5,
                display: 'flex',
                flexDirection: 'column',
                textAlign: 'center',
                alignItems: 'center',
              }}
            >
              <Typography variant="h5" component="h3" sx={{mb: 2}}>
                {mode === 'Add' ? 'Indberet kontrol' : 'Rediger kontrol'}
              </Typography>
              <CompoundPejling>
                {PejlingForm && (
                  <PejlingForm
                    openAddMP={openAddMP}
                    setDynamic={setDynamic}
                    latestMeasurement={latestMeasurement}
                  />
                )}
                <Box gap={1} display={'flex'} justifyContent={'center'} mt={2}>
                  <CompoundPejling.CancelButton />
                  <CompoundPejling.SubmitButton submit={handlePejlingSubmit} />
                </Box>
              </CompoundPejling>
            </Card>
          )}
        </FormProvider>
        <Box display={'flex'} flexDirection={'column'}>
          {Table && (
            <Table
              handleEdit={handleEdit}
              handleDelete={handleDelete}
              disabled={permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit'}
            />
          )}
        </Box>
        <FabWrapper
          icon={<AddCircle />}
          text="Tilføj kontrol"
          disabled={permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit'}
          onClick={() => {
            reset(initialData);
            setShowForm(true);
          }}
          sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
        />
      </StationPageBoxLayout>
    </>
  );
};

export default Pejling;
