import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MinimalSelect = ({boreholeno, boreholenoList, selectedIntake, setSelectedItem}) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.intakeno ? false : true);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setSelectedItem(event.target.value);
    navigate(`../borehole/${boreholeno}/${event.target.value}`, {
      replace: true,
    });
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    if (selectedIntake !== '') {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [selectedIntake]);

  // moves the menu below the select input
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
      disableUnderline
      MenuProps={menuProps}
      value={selectedIntake}
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
      {boreholenoList &&
        boreholenoList
          .filter((i) => i.intakeno !== null)
          .map((intake) => (
            <MenuItem
              key={intake.intakeno}
              value={intake.intakeno}
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
              {intake.boreholeno + ' - ' + intake.intakeno}
            </MenuItem>
          ))}
    </Select>
    //</FormControl>
  );
};

export default MinimalSelect;
