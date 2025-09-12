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

  const mapped_alarms = alarms?.map((alarm) => {
    return {
      id: alarm.id,
      name: alarm.name,
      comment: alarm.comment,
      alarm_notifications: alarm.alarm_notifications ?? [],
      alarm_contacts: alarm.alarm_contacts ?? [],
      group_id: alarm.group_id ?? '',
    } as alarmTable;
  });

  const cancel = () => {
    setOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column" gap={2} mt={-2} overflow={'hidden'}>
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
