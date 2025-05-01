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
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {stationPages} from '~/helpers/EnumHelper';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {
  useCreateTabState,
  useShowFormState,
  useStationPages,
} from '~/hooks/useQueryStateParameters';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {Kontrol} from '../../boreholeno/components/tableComponents/PejlingMeasurementsTableDesktop';
import {useSetAtom} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';
import {initialData} from '~/features/pejling/const';

const Pejling = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const [mode, setMode] = useState<'Add' | 'Edit'>('Add');
  const setIsPump = useSetAtom(boreholeIsPumpAtom);
  const [gid, setGid] = useState<number>(-1);
  const [dynamic, setDynamic] = useState<Array<string | number> | undefined>();
  const {data: timeseries_data} = useTimeseriesData();
  const [showForm, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const [, setTabValue] = useCreateTabState();
  const {post: postPejling, put: putPejling, del: delPejling} = usePejling();

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
      ts_id !== undefined &&
      ts_id !== null &&
      ts_id !== -1 &&
      timeseries_data &&
      timeseries_data.loctype_id !== 9,
  });

  const handlePejlingSubmit = (values: PejlingItem | PejlingBoreholeItem) => {
    const payload = {
      path: `${ts_id}`,
      data: {
        ...values,
        timeofmeas: moment(values.timeofmeas).toISOString(),
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
          setIsPump(false);
        },
      });
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
    const payload = {path: `${ts_id}/${gid}`};
    delPejling.mutate(payload);
  };

  const openAddMP = () => {
    setPageToShow(stationPages.GENERELTUDSTYR);
    setTabValue('udstyr');
    setShowForm(true);
  };

  useEffect(() => {
    setShowForm(null);
    setDynamic([]);
  }, [ts_id]);

  return (
    <>
      <Box>
        <PlotGraph
          key={'pejling' + ts_id}
          dynamicMeasurement={
            pageToShow === stationPages.PEJLING && showForm === true ? dynamic : undefined
          }
        />
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
                <PejlingForm
                  openAddMP={openAddMP}
                  setDynamic={setDynamic}
                  latestMeasurement={latestMeasurement}
                />
                <Box gap={1} display={'flex'} justifyContent={'center'} mt={2}>
                  <CompoundPejling.CancelButton />
                  <CompoundPejling.SubmitButton submit={handlePejlingSubmit} />
                </Box>
              </CompoundPejling>
            </Card>
          )}
        </FormProvider>
        <Box display={'flex'} flexDirection={'column'}>
          <Table
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            disabled={permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit'}
          />
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
