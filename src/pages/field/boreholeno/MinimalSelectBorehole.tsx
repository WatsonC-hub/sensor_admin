import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import React, {useEffect, useState} from 'react';
import {useParams} from 'react-router-dom';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {BoreholeData} from '~/types';

interface MinimalSelectProps {
  boreholeno: string;
  boreholenoList: Array<BoreholeData>;
  selectedIntake: number;
  setSelectedItem: (item: number) => void;
}

const MinimalSelect = ({
  boreholeno,
  boreholenoList,
  selectedIntake,
  setSelectedItem,
}: MinimalSelectProps) => {
  const params = useParams();

  const [isOpen, setIsOpen] = useState(params.intakeno ? false : true);
  const {boreholeIntake} = useNavigationFunctions();

  const handleChange = (event: SelectChangeEvent<string>) => {
    setSelectedItem(event.target.value ? parseInt(event.target.value) : -1);
    // navigate(`../borehole/${boreholeno}/${event.target.value}`, {
    //   replace: true,
    // });
    boreholeIntake(boreholeno, event.target.value, {replace: true});
    setIsOpen(false);
  };

  const handleClose = () => setIsOpen(selectedIntake !== -1 ? false : true);
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    if (selectedIntake !== -1) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [selectedIntake]);

  // moves the menu below the select input
  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: 'primary.main',
      },
    },
  };

  return (
    <Select
      MenuProps={menuProps}
      value={selectedIntake.toString()}
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
      {boreholenoList &&
        boreholenoList
          .filter((i) => i.intakeno !== null)
          .map((intake) => (
            <MenuItem
              key={intake.intakeno}
              value={intake.intakeno}
              sx={{
                color: 'white',
              }}
            >
              {intake.boreholeno + ' - ' + intake.intakeno}
            </MenuItem>
          ))}
    </Select>
  );
};

export default MinimalSelect;
