import MenuItem from '@mui/material/MenuItem';
import Select from '@mui/material/Select';
import React, {useEffect, useState} from 'react';
import {useNavigate, useParams} from 'react-router-dom';

const MinimalSelect = ({boreholeno, boreholenoList, selectedIntake, setSelectedItem}) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.intakeno ? false : true);
  const navigate = useNavigate();

  const handleChange = (event) => {
    let selected = boreholenoList.filter((t) => t.intakeno === parseInt(event.target.value))[0];

    if (!selected) {
      selected = boreholenoList.filter((t) => t.ts_id === parseInt(event.target.value))[0];
    }

    const navigateBorehole = selected.isjupiter;

    if (navigateBorehole) {
      setSelectedItem(selected.intakeno);
      navigate(`../borehole/${boreholeno}/${selected.intakeno}`, {
        replace: true,
      });
      setIsOpen(false);
      return;
    }

    navigate(`../location/${selected.loc_id}/${selected.ts_id}`, {
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
        height: '35px',
      }}
    >
      {boreholenoList &&
        boreholenoList
          .filter((i) => i.intakeno !== null)
          .map((intake, index) => (
            <MenuItem
              key={index}
              value={intake.isjupiter ? intake.intakeno : intake.ts_id}
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
              {intake.intakeno + ' - ' + intake.parameter}
            </MenuItem>
          ))}
    </Select>
    //</FormControl>
  );
};

export default MinimalSelect;
