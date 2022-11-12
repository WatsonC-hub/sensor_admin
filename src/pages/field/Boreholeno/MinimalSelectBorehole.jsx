import React, {useState, useEffect} from 'react';
import {useNavigate, useParams} from 'react-router-dom';
import Select from '@mui/material/Select';
import MenuItem from '@mui/material/MenuItem';
//import FormControl from '@mui/material/FormControlLabel';
import ExpandMoreIcon from '@mui/icons-material/ExpandMore';

const MinimalSelect = ({
  boreholeno,
  boreholenoList,
  selectedIntake,
  setSelectedItem,
  setCurrIntake,
  currentIntake,
}) => {
  const [intakeno, setIntakeNo] = useState(selectedIntake + '');
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.statid ? false : true);
  const navigate = useNavigate();

  const handleChange = (event) => {
    setSelectedItem(event.target.value);
    navigate(`../borehole/${boreholeno}/${event.target.value}`, {
      replace: true,
    });
    setCurrIntake(boreholenoList.find((s) => s.ts_id + '' === event.target.value + ''));
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    setIntakeNo(selectedIntake);
    if (selectedIntake !== '') {
      setIsOpen(false);
    }
  }, [selectedIntake]);

  const iconComponent = (props) => {
    return <ExpandMoreIcon />;
  };

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
    //<FormControl>
    <Select
      disableUnderline
      MenuProps={menuProps}
      IconComponent={iconComponent}
      value={intakeno}
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
      {boreholenoList
        .filter((t) => t.ts_name !== null)
        .map((intake) => (
          <MenuItem key={intake.boreholeno + intake.intakeno} value={intake.intakeno}>
            {intake.boreholeno + ' - ' + intake.intakeno}
          </MenuItem>
        ))}
    </Select>
    //</FormControl>
  );
};

export default MinimalSelect;
