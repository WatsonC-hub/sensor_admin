import {Box, Typography} from '@mui/material';

import React, {ReactNode} from 'react';
import {useAppContext} from '~/state/contexts';
import useLocationTaskHistory from '~/features/tasks/api/useLocationTaskHistory';
import RestartAltIcon from '@mui/icons-material/RestartAlt';
import TaskHistoryCard from './taskListItemComponents/TaskHistoryCard';
const TaskHistoryList = () => {
  const {loc_id} = useAppContext(['loc_id']);
  const {data} = useLocationTaskHistory(loc_id);

  if (!data) return <Layout></Layout>;

  if (data.length === 0) {
    return (
      <Layout>
        <Typography variant="caption">Ingen historik</Typography>
      </Layout>
    );
  }

  return (
    <Layout>
      {data.map((task) => {
        return (
          <Box key={task.id}>
            <TaskHistoryCard task={task} />
          </Box>
        );
      })}
    </Layout>
  );
};

interface LayoutProps {
  children?: ReactNode;
}

const Layout = ({children}: LayoutProps) => {
  const {loc_id} = useAppContext(['loc_id']);
  const {refetch, isFetching} = useLocationTaskHistory(loc_id);
  return (
    <Box display="flex" gap={1} flexDirection={'column'}>
      <Box
        display={'flex'}
        flexDirection={'row'}
        justifyContent={'space-between'}
        alignItems={'center'}
      >
        <Typography variant="h6" fontWeight={'bold'}>
          Historik
        </Typography>
        <RestartAltIcon
          sx={{
            color: 'grey.700',
            cursor: 'pointer',
            ...(isFetching && {animation: 'spin 2s linear infinite'}),
            '@keyframes spin': {
              '0%': {
                transform: 'rotate(360deg)',
              },
              '100%': {
                transform: 'rotate(0deg)',
              },
            },
          }}
          onClick={() => refetch()}
        />
      </Box>
      {children}
    </Box>
  );
};

export default TaskHistoryList;
