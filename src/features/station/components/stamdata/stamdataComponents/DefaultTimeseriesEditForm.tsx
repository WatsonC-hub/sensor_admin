import {Grid} from '@mui/material';
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
    <Grid container spacing={2}>
      <Grid size={size}>
        <StamdataTimeseries.Prefix loc_name={loc_name} disabled={disabled} />
      </Grid>
      <Grid size={size}>
        <StamdataTimeseries.TimeseriesTypeField tstype_id={metadata?.tstype_id} />
      </Grid>
      <Grid
        size={size}
        sx={{
          alignContent: 'center',
        }}
      >
        <StamdataTimeseries.TimeseriesID />
      </Grid>
      {!metadata?.calculated && (
        <Grid size={size}>
          <StamdataTimeseries.ScanCalypsoLabel disabled={disabled} />
        </Grid>
      )}
    </Grid>
  );
};

export default DefaultTimeseriesEditForm;
