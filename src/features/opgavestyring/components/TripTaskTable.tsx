import {Assignment} from '@mui/icons-material';
import {Box, Grid2, Typography} from '@mui/material';
import React from 'react';

import {getIcon} from '~/features/notifications/utils';

import {LocationTasks} from '~/types';

type Props = {
  tasks: Array<LocationTasks> | undefined;
};

const TripTaskTable = ({tasks}: Props) => {
  const gridSize = tasks?.map((task) => task.count).some((count) => count > 9) ? 1.2 : 1;
  return (
    <>
      <Typography variant="h5" ml={2}>
        Opgaver
      </Typography>
      <Box
        display="flex"
        flexDirection="column"
        alignItems={'start'}
        justifyContent="start"
        gap={0.5}
        px={2}
        mt={-1}
      >
        {tasks &&
          tasks.map((task) => {
            return (
              <Grid2
                container
                key={task.blocks_notifications.length > 0 ? task.blocks_notifications[0] : 0}
                alignItems={'center'}
                width={'100%'}
              >
                <Grid2 size={gridSize} alignContent={'center'}>
                  <Typography
                    fontSize={12}
                    display="flex"
                    alignItems={'center'}
                    justifyContent={'space-between'}
                  >
                    {task.count}x
                    {task.blocks_notifications.length > 0 ? (
                      <Box width={18} height={18} alignItems={'center'}>
                        {getIcon({notification_id: task.blocks_notifications[0]}, false)}
                      </Box>
                    ) : (
                      <Box
                        display={'flex'}
                        width={18}
                        height={18}
                        alignItems={'center'}
                        justifyContent={'center'}
                      >
                        {<Assignment fontSize="inherit" />}
                      </Box>
                    )}
                  </Typography>
                </Grid2>
                <Grid2 size={10.5}>
                  <Typography variant="caption">{task.name}</Typography>
                </Grid2>
              </Grid2>
            );
          })}
      </Box>
    </>
  );
};

export default TripTaskTable;
