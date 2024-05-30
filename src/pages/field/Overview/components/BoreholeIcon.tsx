import React from 'react';
import CircleIcon from '@mui/icons-material/Circle';

interface BoreholeIconProps {
  color: string;
  task?: number;
}

const BoreholeIcon = ({color, task}: BoreholeIconProps) => {
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
        <svg width="24" height="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
          <circle
            cx="12"
            cy="12"
            r="9"
            style={{
              fill: color,
              fillOpacity: 0.8,
              stroke: '#000',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 1,
            }}
          />
          <path
            style={{
              fill: 'none',
              stroke: '#000',
              strokeLinecap: 'round',
              strokeLinejoin: 'round',
              strokeWidth: 2,
            }}
            d="M12 16V8"
          />
        </svg>
      );
  }
};

export default BoreholeIcon;
