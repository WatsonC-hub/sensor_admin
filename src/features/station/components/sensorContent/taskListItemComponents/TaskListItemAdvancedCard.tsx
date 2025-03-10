import {Edit, Person} from '@mui/icons-material';
import {
  Box,
  MenuItem,
  Select,
  Typography,
  Card,
  CardHeader,
  CardContent,
  Button,
} from '@mui/material';
import DescriptionIcon from '@mui/icons-material/Description';
import React, {useState} from 'react';
import {useTasks} from '~/features/tasks/api/useTasks';
import {Task} from '~/features/tasks/types';
import PendingActionsIcon from '@mui/icons-material/PendingActions';
import {useTaskHistory} from '~/features/tasks/api/useTaskHistory';
import {useTaskStore} from '~/features/tasks/api/useTaskStore';
import {convertDate} from '~/helpers/dateConverter';
import ChatBubbleOutlineIcon from '@mui/icons-material/ChatBubbleOutline';

type Props = {
  task: Task;
};

const TaskListItemAdvancedCard = ({task}: Props) => {
  const [selectedUser, setSelectedUser] = useState<string | null>(
    task.assigned_display_name ?? 'Ingen tildelt'
  );
  const [selectedStatus, setSelectedStatus] = useState<string>(task.status_name);
  const [showAllComments, setShowAllComments] = useState<boolean>(false);
  const {
    getUsers: {data: taskUsers},
    getStatus: {data: taskStatus},
  } = useTasks();

  const {setSelectedTask} = useTaskStore();

  const {
    get: {data: comments},
  } = useTaskHistory(task.id);

  const filteredComments = comments?.filter((comment) => 'display_name' in comment);
  return (
    <Card
      sx={{
        borderRadius: 4,
        display: 'flex',
        flexDirection: 'column',
        alignContent: 'center',
        justifyContent: 'space-between',
      }}
    >
      <CardHeader
        sx={{
          width: '100%',
          backgroundColor: 'primary.main',
          color: 'white',
          paddingY: 1,
          paddingX: 2,
        }}
        title={
          <Box
            display="flex"
            flexDirection={'row'}
            gap={1}
            alignItems="center"
            justifyContent={'space-between'}
          >
            <Typography variant="caption">{task.name}</Typography>
            <Box gap={1} display="flex">
              <Person />
              <Select
                disableUnderline
                color="primary"
                variant="standard"
                sx={{
                  borderRadius: 4,
                  '.MuiSelect-icon': {color: 'white'},
                  '.MuiSelect-select': {
                    color: 'white',
                    fontSize: 'small',
                    '.Mui-focused': {color: 'white'},
                    padding: 0,
                  },
                }}
                size="small"
                inputProps={{
                  style: {color: 'white', textAlign: 'center'},
                }}
                autoWidth
                value={selectedUser}
                onChange={(e) => {
                  setSelectedUser(e.target.value);
                }}
              >
                <MenuItem value={'Ingen tildelt'}>Ingen er tildelt</MenuItem>
                {taskUsers?.map((user) => (
                  <MenuItem key={user.id} value={user.display_name}>
                    {user.display_name}
                  </MenuItem>
                ))}
              </Select>
            </Box>
          </Box>
        }
      />
      <CardContent
        sx={{paddingBottom: 0, paddingX: 1, '&.MuiCardContent-root:last-child': {paddingY: 1.5}}}
      >
        <Box display={'flex'} flexDirection={'row'} gap={1}>
          <Box
            display="flex"
            gap={1}
            flexDirection={'column'}
            width={'60%'}
            justifyContent={'space-around'}
          >
            <Box display="flex" gap={1} alignItems="center">
              <DescriptionIcon fontSize="small" />
              <Typography variant="caption">{task.description}</Typography>
            </Box>
            <Box display="flex" gap={1} alignItems="center">
              <PendingActionsIcon fontSize="small" />
              <Typography variant="caption" color="grey.700">
                {task.due_date}
              </Typography>
            </Box>
            {filteredComments && filteredComments.length > 0 && (
              <Box display="flex" gap={1} alignItems="center">
                <ChatBubbleOutlineIcon fontSize="small" />

                <Box display="flex" flexDirection={'column'} gap={0.5}>
                  {!showAllComments && (
                    <>
                      <Typography variant="caption" color="grey.700">
                        {filteredComments?.[filteredComments.length - 1]?.comment}
                      </Typography>
                      {filteredComments.length > 1 && (
                        <Typography
                          sx={{textDecoration: 'underline', cursor: 'pointer'}}
                          variant="caption"
                          component="span"
                          onClick={() => setShowAllComments(true)}
                          color="grey.700"
                        >
                          Der er yderligere {filteredComments?.length - 1} kommentarer
                        </Typography>
                      )}
                    </>
                  )}
                  {showAllComments &&
                    filteredComments?.map((comment) => (
                      <Typography key={comment.id} variant="caption" color="grey.700">
                        {comment.comment}
                      </Typography>
                    ))}
                </Box>
              </Box>
            )}
          </Box>
          <Box
            display="flex"
            width={'40%'}
            flexDirection={'column'}
            gap={1}
            justifyContent={'space-between'}
          >
            <Select
              sx={{
                borderRadius: 4,
                '.MuiSelect-select': {
                  fontSize: 'small',
                },
              }}
              size="small"
              autoWidth
              value={selectedStatus}
              onChange={(e) => {
                setSelectedStatus(e.target.value);
              }}
            >
              {taskStatus?.map((status) => (
                <MenuItem key={status.id} value={status.name}>
                  {status.name}
                </MenuItem>
              ))}
            </Select>

            <Box display="flex" flexDirection={'column'} alignItems="center">
              <Box display="flex" flexDirection={'row'} alignItems="center" gap={0.5}>
                <Edit fontSize="small" sx={{color: 'grey.700'}} />
                <Typography variant="caption" fontSize={'0.6rem'} color="grey.700">
                  {convertDate(task.updated_at)}
                </Typography>
                <Typography variant="caption" fontSize={'0.6rem'} color="grey.700">
                  {' - '}
                </Typography>
                <Typography variant="caption" fontSize={'0.6rem'} color="grey.700">
                  {taskUsers?.find((user) => user.id === task.updated_by)?.display_name}
                </Typography>
              </Box>
              <Box display="flex" flexDirection={'row'} alignItems="center" gap={0.5}>
                <Edit fontSize="small" color="primary" />
                <Button
                  variant="text"
                  size="small"
                  onClick={() => setSelectedTask(task.id)}
                  sx={{textTransform: 'initial'}}
                >
                  Rediger opgave
                </Button>
              </Box>
            </Box>
          </Box>
        </Box>
      </CardContent>
    </Card>
  );
};

export default TaskListItemAdvancedCard;
