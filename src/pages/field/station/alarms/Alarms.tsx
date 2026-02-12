import {Box} from '@mui/material';
import React from 'react';
import FabWrapper from '~/components/FabWrapper';
import AlarmTable from '~/features/station/alarms/components/AlarmTable';
import MoreTimeIcon from '@mui/icons-material/MoreTime';
import {useShowFormState, useStationPages} from '~/hooks/useQueryStateParameters';
import AlarmFormDialog from '~/features/station/alarms/components/AlarmFormDialog';
import {useAlarm} from '~/features/station/alarms/api/useAlarm';
import UpdateProgressButton from '~/features/station/components/UpdateProgressButton';
import usePermissions from '~/features/permissions/api/usePermissions';

type AlarmsProps = {
  ts_id?: number;
  loc_id?: number;
};

const Alarms = ({ts_id, loc_id}: AlarmsProps) => {
  const [pageToShow] = useStationPages();
  const [showForm] = useShowFormState();
  const {location_permissions} = usePermissions(loc_id);
  const [open, setOpen] = React.useState(false);
  const {
    get: {data: alarms},
  } = useAlarm();

  const cancel = () => {
    setOpen(false);
  };

  return (
    <Box display="flex" flexDirection="column">
      <AlarmFormDialog open={open} onClose={cancel} setOpen={setOpen} />
      <AlarmTable alarms={alarms} />
      <Box display="flex" justifyContent="flex-end" alignItems="center" gap={1}>
        <UpdateProgressButton
          loc_id={-1}
          disabled={location_permissions !== 'edit'}
          ts_id={ts_id}
          progressKey="alarm"
          alterStyle
        />
        <FabWrapper
          icon={<MoreTimeIcon />}
          text="Tilføj Alarm"
          disabled={location_permissions !== 'edit'}
          onClick={() => setOpen(true)}
          sx={{
            visibility: pageToShow === 'alarm' && showForm === null ? 'visible' : 'hidden',
            ml: 0,
          }}
        />
      </Box>
    </Box>
  );
};

export default Alarms;
