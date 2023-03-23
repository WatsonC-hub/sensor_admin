import {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import FormControl from '@mui/material/FormControl';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MinimalSelect = ({locid, stationList}) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.statid ? false : true);
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
    if (params.statid) {
      setIsOpen(false);
    }
  }, [params.statid]);

  const menuProps = {
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
      value={params.statid}
      onChange={handleChange}
      open={isOpen}
      onOpen={handleOpen}
      onClose={handleClose}
      sx={{
        color: 'white',
        paddingBottom: '2px',
        '& .MuiSelect-icon': {
          color: 'white',
        },
        '& .MuiSelect-selectMenu': {
          backgroundColor: 'blue',
        },

        backgroundColor: 'transparent',
        boxShadow: '0px 5px 8px -3px rgba(0,0,0,0.14)',
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
              {station.ts_name}
            </MenuItem>
          ))}
    </Select>
    // </FormControl>
  );
};

export default MinimalSelect;
