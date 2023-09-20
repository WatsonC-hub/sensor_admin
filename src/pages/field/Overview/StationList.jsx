import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import List from '@mui/material/List';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {TextField, ListItemIcon, ListItem, ListItemText, Typography, Divider} from '@mui/material';
import StraightenIcon from '@mui/icons-material/Straighten';
import {CircularProgress, Box} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import HeightIcon from '@mui/icons-material/Height';
import {FixedSizeList} from 'react-window';
import useWindowDimensions from '../../../hooks/useWindowDimensions';
import {atom, useAtom} from 'jotai';

const typeAheadAtom = atom('');

export default function StationList({data}) {
  const navigate = useNavigate();
  const [typeAhead, settypeAhead] = useAtom(typeAheadAtom);
  const {height, width} = useWindowDimensions();

  const handleClick = (elem) => {
    console.log('elem loc: ', elem);
    navigate(`location/${elem.loc_id}/${elem.ts_id}`);
  };

  if (!data) return <CircularProgress />;

  let rows = data.filter((elem) => {
    const opgave = elem.opgave ? elem.opgave.toLowerCase() : '';
    return (
      elem.ts_name.toLowerCase().includes(typeAhead.toLowerCase()) ||
      elem.calypso_id.toString().toLowerCase().includes(typeAhead.toLowerCase()) ||
      opgave.includes(typeAhead.toLowerCase())
    );
  });

  const Row = ({index, style}) => (
    <ListItem
      onClick={(e) => handleClick(rows[index])}
      dense
      style={style}
      key={index}
      // component="div"
      sx={{
        display: 'flex',
        pl: 0,
      }}
    >
      <ListItemIcon
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          minWidth: '30px',
        }}
      >
        <TypeIcon type={rows[index].tstype_name} />
      </ListItemIcon>
      <ListItemText
        primary={rows[index].ts_name}
        secondary={rows[index].active ? 'Calypso ID: ' + rows[index].calypso_id : ' '}
      />
      {/* <StatusText row={rows[index]} /> */}
      <ListItemIcon
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          minWidth: '30px',
        }}
      >
        <StatusIcon
          color={rows[index].color}
          task={rows[index].opgave}
          active={rows[index].active}
        />
      </ListItemIcon>
    </ListItem>
  );

  return (
    <>
      <TextField
        fullWidth
        variant="outlined"
        label={'Filtrer stationer'}
        InputLabelProps={{shrink: true}}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{marginBottom: 12}}
        size="small"
        align="center"
      />
      <FixedSizeList
        itemSize={65}
        itemCount={rows.length}
        overscanCount={5}
        height={height - 56 - 48 - 59 - 40 - 20 - 50}
        width="100%"
      >
        {Row}
      </FixedSizeList>
    </>
  );
}

function TypeIcon({type}) {
  switch (type) {
    case 'Vandstand':
      return <StraightenIcon style={{color: 'grey', transform: 'rotate(90deg)'}} />;
    case 'Temperatur':
      return (
        <span style={{color: 'grey'}} className="material-icons">
          thermostat
        </span>
      );
    case 'Nedbør':
      return <img width="25" height="25" style={{marginRight: '5px'}} src="/rainIcon.png" />;
    case 'Hastighed':
      return <SpeedIcon style={{color: 'grey'}} />;
    case 'Opløst ilt':
    case 'Vandets iltindhold':
    case 'Ilt mætning':
      return <img width="20" height="20" style={{marginRight: '5px'}} src="/oxygenIcon.png" />;
    case 'Vandføring':
      return <img width="25" height="25" style={{marginRight: '5px'}} src="/waterFlowIcon.png" />;
    case 'Fugtighed':
      return (
        <img width="25" height="25" style={{marginRight: '5px'}} src="/soilMoistureIcon.png" />
      );
    default:
      return '';
  }
}

function StatusIcon({color, active, task}) {
  if (!active) {
    return <CheckCircleIcon style={{color: 'grey'}} />;
  }

  switch (task) {
    case 'Ok':
      return <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    case null:
      return <CheckCircleIcon style={{color: 'mediumseagreen'}} />;
    case 'Sender ikke':
    case 'Sender null':
      return <SignalCellularConnectedNoInternet0BarRoundedIcon style={{color: color}} />;
    case 'Batterskift':
      return <BatteryAlertIcon style={{color: color}} />;
    case 'Tilsyn':
      return <BuildRoundedIcon style={{color: color}} />;
    case 'Pejling':
      return <HeightIcon style={{color: color}} />;
    default:
      return <PriorityHighIcon style={{color: color}} />;
  }
}
