import MenuItem from '@mui/material/MenuItem';
import Select, {SelectChangeEvent} from '@mui/material/Select';
import {useEffect, useState} from 'react';
import {Navigate} from 'react-router-dom';

import {useLocationData} from '~/hooks/query/useMetadata';
import {useNavigationFunctions} from '~/hooks/useNavigationFunctions';
import {useAppContext} from '~/state/contexts';

const MinimalSelect = () => {
  const {loc_id, ts_id} = useAppContext(['loc_id'], ['ts_id']);
  const [isOpen, setIsOpen] = useState(ts_id ? false : true);
  const {station} = useNavigationFunctions();
  const {data: metadata, error, isPending} = useLocationData();

  const hasTimeseries = metadata && metadata.timeseries.some((ts) => ts.ts_id !== null);

  const handleChange = (event: SelectChangeEvent<string>) => {
    if (ts_id?.toString() != event.target.value)
      station(loc_id, parseInt(event.target.value), {replace: true});
    setIsOpen(false);
  };

  const handleClose = () => {
    const value = hasTimeseries && ts_id ? ts_id : '';
    if (typeof value == 'number') {
      setIsOpen(false);
    }
  };
  const handleOpen = () => setIsOpen(true);

  const menuProps = {
    PaperProps: {
      sx: {
        backgroundColor: 'primary.main',
      },
    },
  };

  useEffect(() => {
    if (ts_id) {
      setIsOpen(false);
    }
  }, [ts_id]);

  if (error || isPending) return;

  if (!hasTimeseries) return 'Ingen tidsserie på locationen';

  if (metadata.timeseries.length == 1 && ts_id === undefined) {
    return (
      <>
        <Navigate to={`../location/${loc_id}/${metadata.timeseries[0].ts_id}`} replace />
      </>
    );
  }

  return (
    <Select
      MenuProps={menuProps}
      value={hasTimeseries && ts_id ? ts_id.toString() : ''}
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
      {metadata.timeseries.map((station) => (
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
