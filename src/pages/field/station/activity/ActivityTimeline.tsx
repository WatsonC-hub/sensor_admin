import {zodResolver} from '@hookform/resolvers/zod';
import {AddComment} from '@mui/icons-material';
import {Box, Divider} from '@mui/material';
import dayjs from 'dayjs';
import {FormProvider, useForm} from 'react-hook-form';

import FabWrapper from '~/components/FabWrapper';
import usePermissions from '~/features/permissions/api/usePermissions';
import GraphManager from '~/features/station/components/GraphManager';
import StationPageBoxLayout from '~/features/station/components/StationPageBoxLayout';
import {stationPages} from '~/helpers/EnumHelper';
import useBreakpoints from '~/hooks/useBreakpoints';
import {useShowFormState} from '~/hooks/useQueryStateParameters';
import {useAppContext} from '~/state/contexts';
import ActivityTimelineTable from '../activity/ActivityTimelineTable';
import {activitySchema, ActivitySchemaType} from './types';
import ActivityForm from './ActivityForm';

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

  return (
    <>
      <Box>
        <GraphManager key={'activity' + ts_id} />
      </Box>
      <Divider />
      <StationPageBoxLayout>
        {showForm && <ActivityForm initialData={defaultData} />}
        <ActivityTimelineTable />
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
