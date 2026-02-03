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
import {useState} from 'react';

const defaultData = () =>
  ({
    id: '',
    created_at: dayjs(),
    flags: {},
    flag_ids: [],
  }) as ActivitySchemaType;

export default function ActivityTimeline() {
  const {ts_id, loc_id} = useAppContext(['loc_id'], ['ts_id']);
  const [showForm, setShowForm] = useShowFormState();
  const [formDefaults, setFormDefaults] = useState<ActivitySchemaType>(defaultData());

  const {location_permissions} = usePermissions(loc_id);

  const {data} = useActivities(loc_id, undefined);

  return (
    <>
      <Box>
        <GraphManager key={'activity' + ts_id} />
      </Box>
      <Divider />
      <StationPageBoxLayout>
        {showForm && <ActivityForm initialData={formDefaults} loc_id={loc_id} ts_id={ts_id} />}
        <ActivityTimelineTable
          data={data}
          setEditData={(values) => {
            setFormDefaults({
              created_at: dayjs(values.created_at),
              flags: values.flags ?? {},
              id: values.id,
              flag_ids: Object.keys(values.flags ?? {}).map((id) => Number(id)),
            });
            setShowForm(true);
          }}
        />
      </StationPageBoxLayout>
      <FabWrapper
        icon={<AddComment />}
        text={'Tilføj ' + stationPages.ACTIVITY}
        onClick={() => {
          setShowForm(true);
          setFormDefaults(defaultData());
        }}
        disabled={location_permissions !== 'edit'}
        sx={{visibility: showForm === null ? 'visible' : 'hidden'}}
      />
    </>
  );
}
