import {
  Autocomplete,
  Box,
  Checkbox,
  Chip,
  Divider,
  FormControlLabel,
  TextField,
  Typography,
} from '@mui/material';
import {Noop} from 'react-hook-form';
import React, {useEffect, useMemo, useState} from 'react';
import {locationFilterOptions} from './filter_consts';
import useBreakpoints from '~/hooks/useBreakpoints';

type Props = {
  value: Array<string> | undefined | null;
  setValue: (value: Array<string>) => void;
  isParentClosed: boolean;
  onBlur?: Noop;
  label?: string;
  disabled?: boolean;
};

const LocationFilter = ({value, setValue, isParentClosed, onBlur, label, disabled}: Props) => {
  const [open, setOpen] = useState(false);
  const {isMobile} = useBreakpoints();
  const optionsWithAlle = useMemo(() => [{name: 'Alle'}, ...locationFilterOptions], []);
  useEffect(() => {
    if (value && value.length > 1 && value.includes('Alle')) {
      setValue(value.filter((item) => item == 'Alle'));
    }
  }, [value, setValue]);

  useEffect(() => {
    if (isParentClosed) {
      setOpen(false);
    }
  }, [isParentClosed]);

  useEffect(() => {
    if (isMobile) {
      const close = () => {
        setOpen(false);
      };

      document.addEventListener('touchstart', close);

      return () => {
        document.removeEventListener('touchstart', close);
      };
    }
  }, [isMobile]);

  return (
    <Autocomplete
      open={open}
      onOpen={() => setOpen(true)}
      onClose={() => {
        setOpen(false);
      }}
      sx={{
        marginTop: '8px',
        marginBottom: '4px',
        pb: 1.5,
      }}
      onTouchStart={(e) => {
        if (isMobile) e.stopPropagation();
      }}
      openOnFocus
      disabled={disabled}
      forcePopupIcon={false}
      multiple
      fullWidth
      value={optionsWithAlle.filter((item) => value?.includes(item.name)) ?? []}
      onChange={(event, newValue) => {
        const newObjects = newValue.filter((item) => typeof item != 'string');
        if (newObjects.find((item) => item.name === 'Alle')) {
          if (value && value.length === optionsWithAlle.length - 1) setValue([]);
          if (value && value.length < optionsWithAlle.length - 1) {
            setValue(optionsWithAlle.map((item) => item.name).filter((name) => name !== 'Alle'));
          }

          return;
        }
        setValue(newObjects.map((item) => item.name));
      }}
      id="tags-standard"
      options={optionsWithAlle}
      getOptionLabel={(option) => {
        if (typeof option === 'string') {
          return option;
        }

        return option.name;
      }}
      isOptionEqualToValue={(option, value) => {
        return option.name === value.name;
      }}
      renderTags={(value, getTagProps) => {
        return value.map((option, index) => {
          const content = (
            <Typography display="inline" variant="body2">
              {option.name}
            </Typography>
          );

          return (
            <Chip
              variant="outlined"
              label={content}
              component={'div'}
              {...getTagProps({index})}
              key={index}
            />
          );
        });
      }}
      renderOption={(props, option) => (
        <li {...props} key={option.name}>
          {option.name != 'Alle' ? (
            <FormControlLabel
              control={<Checkbox size="small" checked={value?.includes(option.name) ?? false} />}
              label={<Typography variant="body2">{option.name}</Typography>}
              inert
            />
          ) : (
            <Box sx={{width: '100%'}}>
              <FormControlLabel
                control={
                  <Checkbox
                    size="small"
                    checked={value?.length === optionsWithAlle.length - 1}
                    indeterminate={
                      value != null && value.length > 0 && value.length < optionsWithAlle.length - 1
                    }
                  />
                }
                label={<Typography variant="body2">{option.name}</Typography>}
                inert
              />
              <Divider sx={{my: 1}} />
            </Box>
          )}
        </li>
      )}
      renderInput={(params) => (
        <TextField
          {...params}
          fullWidth
          variant="outlined"
          label={label}
          placeholder="Vælg visning..."
          onBlur={onBlur}
          onTouchStart={() => {
            if (isMobile) {
              setOpen(true);
            }
          }}
          onKeyDown={() => {
            if (!open) setOpen(true);
          }}
          focused={open}
          slotProps={{
            inputLabel: {
              ...params.InputLabelProps,
              shrink: true,
            },
          }}
          sx={{
            '& .MuiInputBase-input.Mui-disabled': {
              WebkitTextFillColor: '#000000',
            },
            '& .MuiInputLabel-root': {color: 'primary.main'}, //styles the label
            '& .MuiInputLabel-root.Mui-disabled': {color: 'rgba(0, 0, 0, 0.38)'}, //styles the label
            '& .MuiOutlinedInput-root': {
              '& > fieldset': {borderColor: 'primary.main'},
            },
          }}
        />
      )}
      slotProps={{
        popper: {
          onTouchStart: (e) => {
            if (isMobile) e.stopPropagation();
          },
          onClick: (e) => {
            if (isMobile) e.stopPropagation();
          },
        },
        listbox: {
          onTouchStart: (e) => {
            if (isMobile) e.stopPropagation();
          },
          onClick: (e) => {
            if (isMobile) e.stopPropagation();
          },
        },
      }}
      disableCloseOnSelect
      selectOnFocus
      handleHomeEndKeys
    />
  );
};

export default LocationFilter;
