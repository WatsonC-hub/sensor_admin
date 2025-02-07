import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {useContext, useEffect, useState} from 'react';

import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {MetadataContext} from '~/state/contexts';

interface MinimalSelectProps {
  locid: number;
  stationList: Array<{
    ts_id: number;
    ts_name: string;
    prefix: string;
    tstype_name: string;
  }>;
}

const MinimalSelect = ({locid, stationList}: MinimalSelectProps) => {
  const metadata = useContext(MetadataContext);
  const ts_id = metadata?.ts_id;
  const [isOpen, setIsOpen] = useState(ts_id ? false : true);
  const {station} = useNavigationFunctions();

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (ts_id?.toString() != event.target.value)
      station(locid, parseInt(event.target.value), {replace: true});
    // navigate(`../location/${locid}/${event.target.value}`, {
    //   replace: true,
    // });
    setIsOpen(false);
  };

  const handleClose = () => {
    const value = hasTimeseries && stationList && ts_id ? ts_id : '';
    if (typeof value == 'number') {
      setIsOpen(false);
    }
  };
  const handleOpen = () => setIsOpen(true);

  useEffect(() => {
    if (ts_id) {
      setIsOpen(false);
    }
  }, [ts_id]);

  const menuProps = {
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
      value={hasTimeseries && stationList && ts_id ? ts_id.toString() : ''}
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
