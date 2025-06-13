import {Box} from '@mui/material';
import {useQuery} from '@tanstack/react-query';
import React from 'react';
import FabWrapper from '~/components/FabWrapper';
import AlarmTable from '~/features/station/alarms/components/AlarmTable';
import {useAppContext} from '~/state/contexts';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import {apiClient} from '~/apiClient';
import {AlarmResponse, alarmTable} from '~/features/station/alarms/types';
import AlarmFormDialog from '~/features/station/alarms/components/AlarmFormDialog';

const Alarms = () => {
  const [pageToShow] = useStationPages();
  const [showForm] = useShowFormState();
  const [open, setOpen] = React.useState(false);
  const {ts_id} = useAppContext(['ts_id']);

  const {data: alarms} = useQuery({
    queryKey: ['alarm', ts_id],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<AlarmResponse>>(
        `/sensor_field/stamdata/alarms/${ts_id}`
      );
      return data;
    },
    enabled: !!ts_id,
  });

  const alarm = alarms
    ? {
        name: alarms?.[0]?.name,
        earliest_timeofday: alarms?.[0]?.earliest_timeofday,
        latest_timeofday: alarms?.[0]?.latest_timeofday,
        alarm_interval: alarms?.[0]?.alarm_interval,
        note_to_include: alarms?.[0]?.note_to_include,
        alarmCriteria: alarms?.[0]?.criteria ?? [],
        alarmContacts: alarms?.[0]?.contacts ?? [],
      }
    : ({} as alarmTable);

  const cancel = () => {
    setOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      <AlarmFormDialog open={open} onClose={cancel} setOpen={setOpen} />
      <AlarmTable alarm={alarm} />
      <FabWrapper
        icon={<MoreTimeIcon />}
        text="Tilføj Alarm"
        onClick={() => setOpen(true)}
        sx={{
          visibility: pageToShow === 'alarm' && showForm === null ? 'visible' : 'hidden',
        }}
      />
    </Box>
  );
};

export default Alarms;
