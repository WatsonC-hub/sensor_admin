import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';

const MinimalSelect = ({locid, stationList}) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.ts_id ? false : true);
  const {station} = useNavigationFunctions();

  const handleChange = (event) => {
    station(locid, event.target.value, {replace: true});
    // navigate(`../location/${locid}/${event.target.value}`, {
    //   replace: true,
    // });
    setIsOpen(false);
  };

  const handleClose = () => {
    const value = hasTimeseries && stationList && params.ts_id ? parseInt(params.ts_id) : '';
    if (typeof value == 'number') {
      setIsOpen(false);
    }
  };
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    if (params.ts_id) {
      setIsOpen(false);
    }
  }, [params.ts_id]);

  const menuProps = {
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
    PaperProps: {
      sx: {
        backgroundColor: 'primary.main',
      },
    },
  };

  const hasTimeseries = stationList && stationList.some((stamdata) => stamdata.ts_id !== null);
  return (
    <Select
      MenuProps={menuProps}
      value={hasTimeseries && stationList && params.ts_id ? parseInt(params.ts_id) : ''}
      onChange={handleChange}
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      sx={{
        outline: 'white',
        color: 'white',
        '& .MuiSelect-icon': {
          color: 'white',
        },
        '& .MuiSelect-select': {
          p: '0px 10px',
          mt: '1px',
        },
        boxShadow: '0px 5px 8px -3px rgba(0,0,0,0.24)',
        borderRadius: '15px',
        height: '35px',
        mb: 1,
        pb: 0,
      }}
    >
      {stationList &&
        stationList
          .filter((t) => t.ts_name !== null)
          .map((station) => (
            <MenuItem
              key={station.ts_id}
              value={station.ts_id}
              sx={{
                color: 'white',
              }}
            >
              {(station.prefix ? station.prefix + ' - ' : '') + ' ' + station.tstype_name}
            </MenuItem>
          ))}
    </Select>
  );
};

export default MinimalSelect;
