import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

const MinimalSelect = ({locid, stationList}) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.ts_id ? false : true);
  const navigate = useNavigate();

  const handleChange = (event) => {
    navigate(`../location/${locid}/${event.target.value}`, {
      replace: true,
    });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    if (params.ts_id) {
      setIsOpen(false);
    }
  }, [params.ts_id]);

  const menuProps = {
    getContentAnchorEl: () => null,
    anchorOrigin: {
      vertical: 'bottom',
      horizontal: 'left',
    },
    transformOrigin: {
      vertical: 'top',
      horizontal: 'left',
    },
  };

  return (
    <Select
      MenuProps={menuProps}
      value={parseInt(params.ts_id)}
      onChange={handleChange}
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      sx={{
        color: 'white',
        '& .MuiSelect-icon': {
          color: 'white',
        },
        '& .MuiSelect-select': {
          p: '0px 14px',
        },
        backgroundColor: 'transparent',
        boxShadow: '0px 5px 8px -3px rgba(0,0,0,0.14)',
        height: '35px',
        mb: 0,
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
                '&:hover': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
                '&.Mui-selected': {
                  backgroundColor: 'primary.main',
                  color: 'white',
                },
              }}
            >
              {(station.prefix ? station.prefix + ' - ' : '') + ' ' + station.tstype_name}
            </MenuItem>
          ))}
    </Select>
  );
};

export default MinimalSelect;
