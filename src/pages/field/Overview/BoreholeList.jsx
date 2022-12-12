import React, {useState} from 'react';
import {useNavigate} from 'react-router-dom';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemText from '@mui/material/ListItemText';
import {TextField, ListItemIcon} from '@mui/material';
import {ReactComponent as BoreholeIcon} from 'public/boreholeIconNofill.svg';
import {CircularProgress} from '@mui/material';
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
      <ListItem onClick={(e) => handleClick(rows[index])} dense style={style} key={index}>
        <ListItemIcon
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            minWidth: '32px',
          }}
        >
          {/* <TypeIcon type={rows[index].tstype_name} /> */}
          <BoreholeIcon width={32} height={32} />
        </ListItemIcon>
        <ListItemText
          primary={rows[index].boreholeno}
          secondary={rows[index].plantid ? 'Anlægs ID: ' + rows[index].plantid : null}
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
        height={height - 56 - 48 - 59 - 40 - 20 - 50}
      >
        {Row}
      </FixedSizeList>
    </div>
  );
}
