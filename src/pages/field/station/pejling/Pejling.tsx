import {AddCircle} from '@mui/icons-material';
import {Box, Typography} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect, useState} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import {usePejling} from '~/features/pejling/api/usePejling';
import LatestMeasurementTable from '~/features/pejling/components/LatestMeasurementTable';
import PejlingForm from '~/features/pejling/components/PejlingForm';
import PejlingMeasurements from '~/features/pejling/components/PejlingMeasurements';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useSearchParam} from '~/hooks/useSeachParam';
import {stamdataStore} from '~/state/store';
import {LatestMeasurement, PejlingItem} from '~/types';

type Props = {
  ts_id: number;
  setDynamic: (dynamic: Array<unknown>) => void;
};

const Pejling = ({ts_id, setDynamic}: Props) => {
  const store = stamdataStore();
  const [canEdit] = useState(true);
  const isWaterlevel = store.timeseries?.tstype_id === 1;
  const isFlow = store.timeseries?.tstype_id === 2;
  const [showForm, setShowForm] = useSearchParam('showForm');
  const [, setPageToShow] = useSearchParam('page');
  const [, setTabValue] = useSearchParam('tab');
  const {post: postPejling, put: putPejling, del: delPejling} = usePejling();
  const {isMobile} = useBreakpoints();
  const initialData = {
    gid: -1,
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  };
  const formMethods = useForm<PejlingItem>({
    defaultValues: initialData,
  });
  // /latest_measurement/{ts_id}

  const {reset, getValues} = formMethods;

  const {data: latestMeasurement} = useQuery({
    queryKey: ['latest_measurement', ts_id],
    queryFn: async () => {
      const {data} = await apiClient
        .get<LatestMeasurement>(`/sensor_field/station/latest_measurement/${ts_id}`)
        .catch((error) => {
          return error.response;
        });
      return data;
    },
    staleTime: 10,
    enabled: ts_id !== undefined && ts_id !== null && ts_id !== -1,
  });

  const handlePejlingSubmit = (values: PejlingItem) => {
    console.log(values);
    const payload = {
      data: {
        ...values,
        isWaterlevel: isWaterlevel,
        stationid: ts_id,
      },
      path: values.gid === -1 ? `${ts_id}` : `${ts_id}/${values.gid}`,
    };
    payload.data.timeofmeas = moment(payload.data.timeofmeas).toISOString();

    if (values.gid === -1) postPejling.mutate(payload);
    else putPejling.mutate(payload);
    setDynamic([]);
    setShowForm(null);
  };

  const handleEdit = (data: PejlingItem) => {
    data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
    reset(data);
    setShowForm('true');
  };

  const handleDelete = (gid: number | undefined) => {
    const payload = {
      path: `${ts_id}/${gid}`,
    };
    delPejling.mutate(payload);
  };

  const openAddMP = () => {
    setPageToShow('stamdata');
    setTabValue('3');
    setShowForm('true');
  };

  const resetFormData = () => {
    reset(initialData);
    setShowForm(null);
  };

  useEffect(() => {
    if (showForm && getValues('gid') === -1) reset(initialData);
  }, [showForm]);

  useEffect(() => {
    if (store.timeseries.ts_id !== 0 && ts_id !== store.timeseries.ts_id) {
      setShowForm(null);
    }
  }, [ts_id]);

  return (
    <FabWrapper
      icon={<AddCircle />}
      text="Tilføj kontrol"
      onClick={() => {
        setShowForm('true');
      }}
      visible={showForm === null ? 'visible' : 'hidden'}
    >
      {isMobile && <Typography variant="h6">Seneste Måling</Typography>}
      <LatestMeasurementTable
        latestMeasurement={typeof latestMeasurement === 'object' ? [latestMeasurement] : []}
        ts_id={ts_id}
      />
      <FormProvider {...formMethods}>
        <Box display={'flex'} flexDirection={'column'} width={'100%'} alignItems={'center'}>
          {showForm === 'true' && (
            <PejlingForm
              isWaterlevel={isWaterlevel}
              openAddMP={openAddMP}
              submit={handlePejlingSubmit}
              resetFormData={resetFormData}
              isFlow={isFlow}
              setDynamic={setDynamic}
              latestMeasurement={latestMeasurement}
            />
          )}
          <PejlingMeasurements
            handleEdit={handleEdit}
            handleDelete={handleDelete}
            canEdit={canEdit}
          />
        </Box>
      </FormProvider>
    </FabWrapper>
  );
};

export default Pejling;
