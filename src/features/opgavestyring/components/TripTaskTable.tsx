import {Box, Typography} from '@mui/material';
import React from 'react';

import {getIcon} from '~/features/notifications/utils';

import {LocationTasks} from '~/types';

type Props = {
  tasks: Array<LocationTasks> | undefined;
};

const TripTaskTable = ({tasks}: Props) => {
  const value = tasks?.reduce((acc: Record<string, {count: number; name: string}>, task) => {
    if (task.blocks_notifications !== undefined && task.blocks_notifications.length > 0) {
      task.blocks_notifications?.forEach((block) => {
        if (acc[block] === undefined) {
          acc[block] = {count: 1, name: task.name};
        } else acc[block].count += 1;
      });
      return acc;
    } else {
      if (acc[0] === undefined) {
        acc[0] = {count: 1, name: 'Manuelle opgaver'};
      } else acc[0].count += 1;
      return acc;
    }
  }, {});
  return (
    <>
      <Box display="flex" flexDirection="column" alignItems={'start'} justifyContent="start" p={1}>
        <Typography variant="h6" fontWeight={'bold'}>
          Opgaver
        </Typography>
        <Box display="flex" flexDirection="column">
          {value &&
            Object.keys(value).map((notification_id) => {
              const id = parseInt(notification_id);
              return (
                <Box key={notification_id} ml={0.5} display="flex" alignItems={'center'}>
                  {id !== 0 && (
                    <Box display={'flex'} width={18} height={18}>
                      {getIcon({notification_id: id}, false)}
                    </Box>
                  )}
                  <Typography variant="caption">{value?.[id].count}x</Typography>
                  &nbsp;
                  <Typography variant="caption">{value?.[id].name}</Typography>
                </Box>
              );
            })}
        </Box>
      </Box>
    </>
  );
};

export default TripTaskTable;
