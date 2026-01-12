import {Grid2} from '@mui/material';
import React from 'react';
import usePermissions from '~/features/permissions/api/usePermissions';
import {useAppContext} from '~/state/contexts';
import StamdataTimeseries from '../StamdataTimeseries';
import {useTimeseriesData} from '~/hooks/query/useMetadata';

type Props = {
  size: number;
  loc_name: string | undefined;
};
const DefaultTimeseriesEditForm = ({size, loc_name}: Props) => {
  const {loc_id, ts_id} = useAppContext([], ['loc_id', 'ts_id']);
  const {data: metadata} = useTimeseriesData(ts_id);
  const {location_permissions} = usePermissions(loc_id);
  const disabled = location_permissions !== 'edit';
  return (
    <Grid2 container spacing={2}>
      <Grid2 size={size}>
        <StamdataTimeseries.Prefix loc_name={loc_name} disabled={disabled} />
      </Grid2>
      <Grid2 size={size}>
        <StamdataTimeseries.TimeriesTypeField tstype_id={metadata?.tstype_id} />
      </Grid2>
      {!metadata?.calculated && (
        <Grid2 size={size}>
          <StamdataTimeseries.SensorDepth disabled={disabled} />
        </Grid2>
      )}
      <Grid2 size={size} alignContent={'center'}>
        <StamdataTimeseries.TimeseriesID />
      </Grid2>
      {!metadata?.calculated && (
        <Grid2 size={size}>
          <StamdataTimeseries.ScanCalypsoLabel />
        </Grid2>
      )}
    </Grid2>
  );
};

export default DefaultTimeseriesEditForm;
