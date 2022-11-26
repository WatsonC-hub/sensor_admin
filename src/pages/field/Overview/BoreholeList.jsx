import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import Typography from '@mui/material/Typography';
import PriorityHighIcon from '@mui/icons-material/PriorityHigh';
import CheckCircleIcon from '@mui/icons-material/CheckCircle';
import {TextField} from '@mui/material';
import Divider from '@mui/material/Divider';
import StraightenIcon from '@mui/icons-material/Straighten';
import {CircularProgress} from '@mui/material';
import SpeedIcon from '@mui/icons-material/Speed';
import SignalCellularConnectedNoInternet0BarRoundedIcon from '@mui/icons-material/SignalCellularConnectedNoInternet0BarRounded';
import BatteryAlertIcon from '@mui/icons-material/BatteryAlert';
import BuildRoundedIcon from '@mui/icons-material/BuildRounded';
import HeightIcon from '@mui/icons-material/Height';
import {FixedSizeList} from 'react-window';
import useWindowDimensions from '../../../hooks/useWindowDimensions';

export default function BoreholeList({data}) {
  const navigate = useNavigate();
  const [typeAhead, settypeAhead] = useState('');
  const {height, width} = useWindowDimensions();

  const handleClick = (elem) => {
    navigate(`borehole/${elem.boreholeno}/${1}`);
  };

  if (!data) return <CircularProgress />;

  let rows = data.filter((elem) => {
    return (
      elem.boreholeno.toLowerCase().includes(typeAhead.toLowerCase()) ||
      elem.plantid.toString().toLowerCase().includes(typeAhead.toLowerCase())
    );
  });

  const Row = ({index, style}) => (
    <>
      <ListItem
        onClick={(e) => handleClick(rows[index])}
        dense
        style={style}
        key={index}
        component="div"
        disablePadding
      >
        <ListItemText
          primary={'Boringsnavn: ' + rows[index].boreholeno}
          secondary={'Anlægs ID: ' + rows[index].plantid}
        />
      </ListItem>
    </>
  );

  return (
    <div>
      <TextField
        fullWidth
        variant="outlined"
        label={'Filtrer boringer'}
        InputLabelProps={{shrink: true}}
        placeholder="Søg"
        value={typeAhead}
        onChange={(event) => settypeAhead(event.target.value)}
        style={{marginBottom: 12}}
        size="small"
        align="center"
      />
      <FixedSizeList
        itemSize={46}
        itemCount={rows.length}
        overscanCount={5}
        height={height - 56 - 48 - 40 - 80}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
