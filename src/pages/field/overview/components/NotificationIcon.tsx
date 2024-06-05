import {BatteryAlertRounded} from '@mui/icons-material';
import HeightIcon from '@mui/icons-material/Height';
import NotificationImportantIcon from '@mui/icons-material/NotificationImportant';
import SpeedIcon from '@mui/icons-material/Speed';
import {Avatar} from '@mui/material';
import React from 'react';

//Imports
import {TableData} from '~/types';

export const statusStyling = (flagColor: string) => {
  return {
    bgcolor: flagColor,
    textAlign: 'center',
    stroke: 'black',
    strokeWidth: 1,
    width: 30,
    height: 30,
  };
};

const NotificationIcon = (tableData: TableData) => {
  switch (tableData.flag) {
    case 0:
      switch (tableData.opgave) {
        case 'Niveau spring':
          return (
            <Avatar sx={statusStyling(tableData.color)}>
              <HeightIcon />
            </Avatar>
          );
        case 'Abnormal hændelse':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'PC - Niveau spring':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Spike':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Plateau':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Niveau spring - negativ':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Niveau spring - positiv':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
      }
      break;
    case 1:
      switch (tableData.opgave) {
        case 'Pejling snart':
          return (
            <Avatar sx={statusStyling(tableData.color)}>
              <NotificationImportantIcon />
            </Avatar>
          );
        case 'Tilsyn snart':
          return (
            <Avatar sx={statusStyling(tableData.color)}>
              <SpeedIcon />
            </Avatar>
          );
        case 'Batteriskift':
          return (
            <Avatar sx={statusStyling(tableData.color)}>
              <BatteryAlertRounded />
            </Avatar>
          );
      }
      break;
    case 2:
      switch (tableData.opgave) {
        case 'Pejling overskredet':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Tilsyn overskredet':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
      }
      break;
    case 3:
      switch (tableData.opgave) {
        case 'Lavt iltindhold':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Data mangler på graf':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Sender ikke':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case '>5 null værdier seneste 12 timer':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
        case 'Fejl i tidsstempler':
          return <Avatar sx={statusStyling(tableData.color)}></Avatar>;
      }
      break;
    default:
      return <Avatar sx={statusStyling(tableData.color)} />;
  }
};

export default NotificationIcon;
