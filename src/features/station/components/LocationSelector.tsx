import {KeyboardBackspace} from '@mui/icons-material';
import {Box, IconButton, Tooltip, Typography} from '@mui/material';
import {queryOptions, useQuery, QueryClient, useSuspenseQuery} from '@tanstack/react-query';
import React from 'react';
import {useLoaderData, useNavigate, useParams} from 'react-router-dom';

import {apiClient} from '~/apiClient';
import {AppBarLayout} from '~/components/NavBar';
import {LoaderFunction} from '~/types';

import MinimalSelect from './MinimalSelect';

type Data = Array<{
  ts_id: number;
  ts_name: string;
  prefix: string;
  tstype_name: string;
  loc_name: string;
}>;

const options = (loc_id: number) =>
  queryOptions({
    queryKey: ['stations', loc_id],
    queryFn: async () => {
      const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
      return data as Data;
    },
  });

export const loader: LoaderFunction<{loc_id: number}> =
  ({queryClient}) =>
  async ({params}) => {
    if (!params.locid) {
      throw new Error('locid is required');
    }
    const loc_id = parseInt(params.locid);
    // const {data} = await apiClient.get(`/sensor_field/station/metadata_location/${loc_id}`);
    // queryClient.setQueryData(['stations', loc_id], data);
    await queryClient.prefetchQuery(options(loc_id));
    return {loc_id};
  };

const LocationSelector = () => {
  const {loc_id} = useLoaderData() as Awaited<ReturnType<ReturnType<typeof loader>>>;
  const navigate = useNavigate();
  const {data} = useSuspenseQuery({
    ...options(loc_id),
    staleTime: 1000,
  });

  const hasTimeseries = data && data.some((stamdata: {ts_id: number}) => stamdata.ts_id !== null);

  return (
    <AppBarLayout>
      <IconButton
        color="inherit"
        onClick={() => {
          navigate(-1);
        }}
        size="large"
      >
        <KeyboardBackspace />
      </IconButton>

      <Box display="block" flexGrow={1} overflow="hidden">
        <Tooltip title={data[0].loc_name} arrow enterTouchDelay={0}>
          <Typography pl={1.7} textOverflow="ellipsis" overflow="hidden" whiteSpace="nowrap">
            {data[0].loc_name}
          </Typography>
        </Tooltip>
        {hasTimeseries ? (
          <MinimalSelect locid={loc_id} stationList={data} />
        ) : hasTimeseries === false ? (
          'Ingen tidsserie på lokationen'
        ) : (
          ''
        )}
      </Box>
    </AppBarLayout>
  );
};

export default LocationSelector;
