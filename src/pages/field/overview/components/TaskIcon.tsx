import CircleIcon from '@mui/icons-material/Circle';
import React from 'react';

interface TaskIconProps {
  color: string;
  task?: number;
}

const TaskIcon = ({color, task}: TaskIconProps) => {
  switch (task) {
    case 1:
      return (
        <CircleIcon
          sx={{
            color: color,
            textAlign: 'center',
            stroke: 'black',
            strokeWidth: 1,
          }}
        />
      );
    case 2:
      return (
        <CircleIcon
          sx={{
            color: color,
            textAlign: 'center',
            stroke: 'black',
            strokeWidth: 1,
          }}
        />
      );
    case 3:
      return (
        <CircleIcon
          sx={{
            color: color,
            textAlign: 'center',
            stroke: 'black',
            strokeWidth: 1,
          }}
        />
      );
    case 4:
      return (
        <CircleIcon
          sx={{
            color: color,
            textAlign: 'center',
            stroke: 'black',
            strokeWidth: 1,
          }}
        />
      );
    default:
      return (
        <CircleIcon
          sx={{
            color: color,
            textAlign: 'center',
            stroke: 'black',
            strokeWidth: 1,
          }}
        />
      );
  }
};

export default TaskIcon;
