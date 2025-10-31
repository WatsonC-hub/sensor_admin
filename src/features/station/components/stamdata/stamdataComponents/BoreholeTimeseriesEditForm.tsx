import {Grid2} from '@mui/material';
import React from 'react';
import StamdataTimeseries from '../StamdataTimeseries';
import {useTimeseriesData} from '~/hooks/query/useMetadata';
import {useAppContext} from '~/state/contexts';
import usePermissions from '~/features/permissions/api/usePermissions';

type Props = {size: number};

const BoreholeTimeseriesEditForm = ({size}: Props) => {
  const {ts_id, loc_id} = useAppContext([], ['ts_id', 'loc_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataTimeseries.Intakeno disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TimeriesTypeField tstype_id={metadata?.tstype_id} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.SensorDepth disabled={disabled} />
      </Grid2>
      <Grid2 size={size} alignContent={'center'}>
        <StamdataTimeseries.Hidden />
      </Grid2>
      <Grid2 size={size} alignContent={'center'}>
        <StamdataTimeseries.TimeseriesID />
      </Grid2>
    </Grid2>
  );
};

export default BoreholeTimeseriesEditForm;
