import {Typography} from '@mui/material';
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

  if (!hasTimeseries) return <Typography color={'white'}>Ingen tidsserie på locationen</Typography>;

  if (metadata.timeseries.length == 1 && ts_id === undefined) {
    return (
      <>
        <Navigate to={`../location/${loc_id}/${metadata.timeseries[0].ts_id}`} replace />
      </>
    );
  }

  return (
    <>
      {metadata.timeseries.length > 1 ? (
        <Select
          MenuProps={menuProps}
          value={hasTimeseries && ts_id ? ts_id.toString() : ''}
          onChange={handleChange}
          open={isOpen}
          onOpen={handleOpen}
          onClose={handleClose}
          sx={{
            maxWidth: '200px',
            outline: 'white',
            color: 'white',
            '& .MuiSelect-icon': {
              color: 'white',
            },
            '& .MuiSelect-select': {
              p: '0px 10px',
              mt: '1px',
            },
            '.MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '&.Mui-focused .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            '&:hover .MuiOutlinedInput-notchedOutline': {
              borderColor: 'white',
            },
            borderRadius: '15px',
            border: '1px solid white',
            height: '35px',
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
      ) : (
        <Typography color="white" fontSize={14}>
          {(metadata.timeseries[0].prefix ? metadata.timeseries[0].prefix + ' - ' : '') +
            ' ' +
            metadata.timeseries[0].tstype_name}
        </Typography>
      )}
    </>
  );
};

export default MinimalSelect;
