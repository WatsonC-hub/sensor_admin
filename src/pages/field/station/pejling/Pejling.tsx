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

import GraphManager from '~/features/station/components/GraphManager';
import usePejlingForm from '~/features/station/components/pejling/api/usePejlingForm';
import CompoundPejling from '~/features/station/components/pejling/CompoundPejling';
import {
  PejlingBoreholeSchemaType,
  PejlingSchemaType,
} from '~/features/station/components/pejling/PejlingSchema';
import {PejlingItem, LatestMeasurement} from '~/types';
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
import {useSetAtom} from 'jotai';
import {boreholeIsPumpAtom} from '~/state/atoms';

const Pejling = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id', 'ts_id']);
  const setIsPump = useSetAtom(boreholeIsPumpAtom);
  const [gid, setGid] = useState<number | undefined>(undefined);
  const [dynamic, setDynamic] = useState<Array<string | number> | undefined>();
  const {data: timeseries_data} = useTimeseriesData();
  const [showForm, setShowForm] = useShowFormState();
  const [pageToShow, setPageToShow] = useStationPages();
  const [, setTabValue] = useCreateTabState();
  const {
    get: {data: measurements},
    post: postPejling,
    put: putPejling,
    del: delPejling,
  } = usePejling();

  const {
    feature_permission_query: {data: permissions},
    location_permissions,
  } = usePermissions(loc_id);

  const [formMethods, PejlingForm, Table, getInitialData] = usePejlingForm({
    loctype_id: timeseries_data?.loctype_id,
    tstype_id: timeseries_data?.tstype_id,
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
    enabled: ts_id !== undefined && ts_id !== null && ts_id !== -1,
  });

  useEffect(() => {
    setIsPump(measurements?.[0]?.pumpstop || measurements?.[0]?.service ? true : false);
  }, [measurements]);

  const handlePejlingSubmit = (values: PejlingSchemaType | PejlingBoreholeSchemaType) => {
    const payload = {
      path: `${ts_id}`,
      data: {
        ...values,
        timeofmeas: values.timeofmeas,
      },
    };

    if (gid === undefined) {
      postPejling.mutate(payload, {
        onSuccess: () => {
          reset(getInitialData());
          setDynamic([]);
          setShowForm(null);
        },
      });
    } else {
      payload.path = `${ts_id}/${gid}`;
      putPejling.mutate(payload, {
        onSuccess: () => {
          reset(getInitialData());
          setShowForm(null);
          setGid(undefined);
        },
      });
    }
  };

  const handleCancel = () => {
    setShowForm(null);
    reset(getInitialData());
    setGid(undefined);
  };

  const handleEdit = (data: PejlingItem) => {
    data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
    reset(data);
    setShowForm(true);
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
        <GraphManager
          key={'pejling' + ts_id}
          dynamicMeasurement={
            pageToShow === stationPages.PEJLING && showForm === true ? dynamic : undefined
          }
          defaultDataToShow={{
            Kontrolmålinger: true,
          }}
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
              <Typography variant="h5" component="h3">
                {gid === undefined ? 'Indberet kontrol' : 'Rediger kontrol'}
              </Typography>

              <CompoundPejling
                submit={handlePejlingSubmit}
                cancel={handleCancel}
                latestMeasurement={latestMeasurement}
                openAddMP={openAddMP}
                setDynamic={setDynamic}
              >
                <PejlingForm />
                <Box gap={1} display={'flex'} justifyContent={'center'} mt={2}>
                  <CompoundPejling.CancelButton />
                  <CompoundPejling.SubmitButton />
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
      </StationPageBoxLayout>
      <FabWrapper
        icon={<AddCircle />}
        text="Tilføj kontrol"
        disabled={permissions?.[ts_id] !== 'edit' && location_permissions !== 'edit'}
        onClick={() => {
          setIsPump(measurements?.[0]?.pumpstop || measurements?.[0]?.service ? true : false);
          reset(getInitialData());
          setShowForm(true);
        }}
        sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
      />
    </>
  );
};

export default Pejling;
