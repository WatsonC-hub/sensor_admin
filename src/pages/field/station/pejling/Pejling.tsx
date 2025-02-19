import {AddCircle} from '@mui/icons-material';
import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import moment from 'moment';
import React, {useEffect} from 'react';
import {FormProvider, useForm} from 'react-hook-form';

import {apiClient} from '~/apiClient';
import FabWrapper from '~/components/FabWrapper';
import {usePejling} from '~/features/pejling/api/usePejling';
import LatestMeasurementTable from '~/features/pejling/components/LatestMeasurementTable';
import PejlingForm from '~/features/pejling/components/PejlingForm';
import PejlingMeasurements from '~/features/pejling/components/PejlingMeasurements';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import useBreakpoints from '~/hooks/useBreakpoints';
import {
  useCreateTabState,
  useShowFormState,
  useStationPages,
} from '~/hooks/useQueryStateParameters';
import {APIError} from '~/queryClient';
import {useAppContext} from '~/state/contexts';
import {LatestMeasurement, PejlingItem} from '~/types';

type Props = {
  setDynamic: (dynamic: Array<string | number> | undefined) => void;
};

const Pejling = ({setDynamic}: Props) => {
  const {ts_id} = useAppContext(['ts_id']);
  const {data: timeseries_data} = useTimeseriesData();
  const isWaterlevel = timeseries_data?.tstype_id === 1;
  const [showForm, setShowForm] = useShowFormState();
  const [, setPageToShow] = useStationPages();
  const [, setTabValue] = useCreateTabState();
  const {post: postPejling, put: putPejling, del: delPejling} = usePejling();
  const {isTouch, isLaptop} = useBreakpoints();

  const initialData = {
    gid: -1,
    timeofmeas: moment().format('YYYY-MM-DDTHH:mm'),
    measurement: 0,
    useforcorrection: 0,
    comment: '',
  };

  const formMethods = useForm<PejlingItem>({defaultValues: initialData});

  const {reset, getValues} = formMethods;

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
    if (showForm && getValues('gid') === -1) reset(initialData);
  }, [showForm]);

  useEffect(() => {
    setShowForm(null);
    reset(initialData);
  }, [ts_id]);

  const handlePejlingSubmit = (values: PejlingItem) => {
    const payload = {
      data: {...values, isWaterlevel: isWaterlevel, stationid: ts_id},
      path: values.gid === -1 ? `${ts_id}` : `${ts_id}/${values.gid}`,
    };
    payload.data.timeofmeas = moment(payload.data.timeofmeas).toISOString();

    if (values.gid === -1) postPejling.mutate(payload);
    else putPejling.mutate(payload);
    setDynamic([]);
    setShowForm(null);
    if (values.gid !== -1) reset(initialData);
  };

  const handleEdit = (data: PejlingItem) => {
    data.timeofmeas = data.timeofmeas.replace(' ', 'T').substr(0, 19);
    reset(data);
    setShowForm(true);
  };

  const handleDelete = (gid: number | undefined) => {
    const payload = {path: `${ts_id}/${gid}`};
    delPejling.mutate(payload);
  };

  const openAddMP = () => {
    setPageToShow('stamdata');
    setTabValue('udstyr');
    setShowForm(true);
  };

  const resetFormData = () => {
    reset(initialData);
    setShowForm(null);
  };

  return (
    <Box mx={1}>
      <LatestMeasurementTable
        latestMeasurement={latestMeasurement}
        errorMessage={
          isError && typeof error?.response?.data.detail == 'string'
            ? error?.response?.data.detail
            : undefined
        }
      />
      <FormProvider {...formMethods}>
        <Box display={'flex'} flexDirection={'column'} width={'100%'} alignItems={'center'}>
          {showForm === true && (
            <PejlingForm
              openAddMP={openAddMP}
              submit={handlePejlingSubmit}
              resetFormData={resetFormData}
              setDynamic={setDynamic}
              latestMeasurement={latestMeasurement}
            />
          )}
        </Box>
      </FormProvider>
      <Box display={'flex'} flexDirection={'column'}>
        <PejlingMeasurements handleEdit={handleEdit} handleDelete={handleDelete} />
        <FabWrapper
          icon={<AddCircle />}
          text="Tilføj kontrol"
          onClick={() => {
            setShowForm(true);
          }}
          sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
        ></FabWrapper>
      </Box>
    </Box>
  );
};

export default Pejling;
