import {Grid} from '@mui/material';
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
    <Grid container spacing={2}>
      <Grid size={size}>
        <StamdataTimeseries.Intakeno disabled={disabled} />
      </Grid>
      <Grid size={size}>
        <StamdataTimeseries.TimeseriesTypeField tstype_id={metadata?.tstype_id} />
      </Grid>
      <Grid
        size={{xs: 12, sm: 2}}
        sx={{
          alignContent: 'center',
        }}
      >
        <StamdataTimeseries.TimeseriesID />
      </Grid>
      {!metadata?.calculated && (
        <Grid size={{xs: 12, sm: 4}}>
          <StamdataTimeseries.ScanCalypsoLabel disabled={disabled} />
        </Grid>
      )}
    </Grid>
  );
};

export default BoreholeTimeseriesEditForm;
