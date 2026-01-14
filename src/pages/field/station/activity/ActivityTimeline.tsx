import {AddComment} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import dayjs from 'dayjs';

import FabWrapper from '~/components/FabWrapper';
import usePermissions from '~/features/permissions/api/usePermissions';
import GraphManager from '~/features/station/components/GraphManager';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {stationPages} from '~/helpers/EnumHelper';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
import ActivityTimelineTable from '../activity/ActivityTimelineTable';
import {ActivitySchemaType} from './types';
import ActivityForm from './ActivityForm';
import {useActivities} from './activityQueries';

const defaultData = () =>
  ({
    id: -1,
    created_at: dayjs(),
    onTimeseries: false,
    comment: '',
    flag_ids: [],
  }) as ActivitySchemaType;

export default function ActivityTimeline() {
  const {ts_id, loc_id} = useAppContext(['loc_id'], ['ts_id']);
  const [showForm, setShowForm] = useShowFormState();

  const {location_permissions} = usePermissions(loc_id);

  const {data} = useActivities(loc_id, ts_id);

  return (
    <>
      <Box>
        <GraphManager key={'activity' + ts_id} />
      </Box>
      <Divider />
      <StationPageBoxLayout>
        {showForm && <ActivityForm initialData={defaultData} loc_id={loc_id} ts_id={ts_id} />}
        <ActivityTimelineTable data={data} />
      </StationPageBoxLayout>
      <FabWrapper
        icon={<AddComment />}
        text={'Tilføj ' + stationPages.ACTIVITY}
        onClick={() => {
          setShowForm(true);
        }}
        disabled={location_permissions !== 'edit'}
        sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
      />
    </>
  );
}
