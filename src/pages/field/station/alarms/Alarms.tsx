import {Box} from '@mui/material';
import React from 'react';
import FabWrapper from '~/components/FabWrapper';
import AlarmTable from '~/features/station/alarms/components/AlarmTable';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import {alarmTable} from '~/features/station/alarms/types';
import AlarmFormDialog from '~/features/station/alarms/components/AlarmFormDialog';
import {useAlarm} from '~/features/station/alarms/api/useAlarm';

const Alarms = () => {
  const [pageToShow] = useStationPages();
  const [showForm] = useShowFormState();
  const [open, setOpen] = React.useState(false);

  const {
    get: {data: alarms},
  } = useAlarm();

  const mapped_alarms = alarms?.map(
    (alarm) =>
      ({
        gid: alarm.gid,
        name: alarm.name,
        earliest_timeofday: alarm.earliest_timeofday,
        latest_timeofday: alarm.latest_timeofday,
        alarm_interval: alarm.alarm_interval,
        note_to_include: alarm.note_to_include,
        alarmCriteria: alarm.criteria ?? [],
        alarmContacts: alarm.contacts ?? [],
        signal_warning: alarm.signal_warning ?? false,
      }) as alarmTable
  );

  const cancel = () => {
    setOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={1}>
      <AlarmFormDialog open={open} onClose={cancel} setOpen={setOpen} />
      <AlarmTable alarms={mapped_alarms} />
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
