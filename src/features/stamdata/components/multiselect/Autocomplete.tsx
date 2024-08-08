import CheckBoxIcon from '@mui/icons-material/CheckBox';
import CheckBoxOutlineBlankIcon from '@mui/icons-material/CheckBoxOutlineBlank';
import Autocomplete from '@mui/material/Autocomplete';
import Checkbox from '@mui/material/Checkbox';
import TextField from '@mui/material/TextField';
import * as React from 'react';
import {useEffect, useState} from 'react';
import {useFormContext} from 'react-hook-form';

import {useRessourcer} from '~/features/stamdata/api/useRessourcer';
import type {MultiSelectProps, Ressourcer} from '~/features/stamdata/components/multiselect/types';

const icon = <CheckBoxOutlineBlankIcon fontSize="small" />;
const checkedIcon = <CheckBoxIcon fontSize="small" />;

interface CheckboxesTagsProps extends MultiSelectProps {
  value: Array<Ressourcer>;
  setValue: (value: Array<Ressourcer>) => void;
}

export default function CheckboxesTags({value, setValue, onBlur, ...props}: CheckboxesTagsProps) {
  const [selected, setSelected] = useState(value);
  const {watch} = useFormContext();
  const {
    get: {data: options},
  } = useRessourcer();

  const tstype_id = watch('timeseries.tstype_id');
  const loctype_id = watch('location.loctype_id');

  useEffect(() => {
    console.log(value);
    if (value && value.length > 0) {
      setSelected(value);
    }
  }, [value]);

  useEffect(() => {
    if (options && options.length > 0 && (tstype_id !== -1 || loctype_id !== -1)) {
      if (value.length === 0) {
        const test = options.filter(
          (ressource) =>
            (ressource.loctype_id && ressource.loctype_id.includes(loctype_id)) ||
            (ressource.tstype_id && ressource.tstype_id.includes(tstype_id))
        );
        setSelected(test);
      }
    }
  }, [tstype_id, loctype_id, options, value]);

  return (
    <>
      {options && options.length > 0 && (
        <Autocomplete
          multiple
          id="checkboxes-tags-demo"
          options={options ?? []}
          value={selected ?? []}
          disableCloseOnSelect
          getOptionLabel={(option) => option.navn}
          isOptionEqualToValue={(option, value) => option.id === value.id}
          renderOption={(props, option, {selected}) => (
            <li {...props}>
              <Checkbox
                icon={icon}
                checkedIcon={checkedIcon}
                style={{marginRight: 8}}
                checked={selected}
              />
              {option.navn}
            </li>
          )}
          style={{width: 500}}
          renderInput={(params) => (
            <TextField
              onBlur={onBlur}
              {...params}
              label="Checkboxes"
              placeholder="Udvalgte redskaber"
            />
          )}
          onChange={(event, newValue) => {
            console.log(newValue);
            setSelected(newValue);
            setValue(newValue);
          }}
          {...props}
        />
      )}
    </>
  );
}
