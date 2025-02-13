import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {useQuery} from '@tanstack/react-query';
import React, {useEffect, useState} from 'react';

import {apiClient} from '~/apiClient';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useAppContext} from '~/state/contexts';
import {BoreholeData} from '~/types';

const MinimalSelect = () => {
  const {boreholeno, intakeno} = useAppContext(['boreholeno'], ['intakeno']);
  const [isOpen, setIsOpen] = useState(intakeno ? false : true);
  const {boreholeIntake} = useNavigationFunctions();
  const [selectedItem, setSelectedItem] = useState<number | undefined>();

  // moves the menu below the select input
  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: 'primary.main',
      },
    },
  };

  const {data: data} = useQuery({
    queryKey: ['borehole', boreholeno],
    queryFn: async () => {
      const {data} = await apiClient.get<Array<BoreholeData>>(
        `/sensor_field/borehole/jupiter/${boreholeno}`
      );
      return data;
    },
    enabled: boreholeno !== undefined,
    placeholderData: [],
  });

  useEffect(() => {
    console.log(data);
    if (data && boreholeno) {
      if (intakeno) {
        setSelectedItem(intakeno);
        boreholeIntake(boreholeno, intakeno, {replace: true});
      } else {
        if (data.length === 1) {
          setSelectedItem(data[0].intakeno);
          boreholeIntake(boreholeno, data[0].intakeno, {replace: true});
        }
      }
    }
  }, [data]);

  const handleChange = (event: SelectChangeEvent<string>) => {
    console.log(event.target.value);
    if (selectedItem?.toString() !== event.target.value)
      boreholeIntake(boreholeno, event.target.value, {replace: true});
    handleClose();
  };

  const handleClose = () => setIsOpen(false);
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    console.log(selectedItem);
    if (selectedItem !== undefined) {
      setIsOpen(false);
    } else {
      setIsOpen(true);
    }
  }, [selectedItem]);

  return (
    <Select
      MenuProps={menuProps}
      value={selectedItem !== undefined ? selectedItem.toString() : ''}
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
      {data &&
        data
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
