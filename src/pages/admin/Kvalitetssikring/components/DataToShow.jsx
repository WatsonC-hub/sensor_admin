// Component with a list of checkboces to select which data to show

import {FormControlLabel, FormGroup, Switch} from '@mui/material';
import {useAtom} from 'jotai';
import React from 'react';
import {dataToShowAtom} from 'src/state/atoms';

export default function DataToShow() {
  const [dataToShow, setDataToShow] = useAtom(dataToShowAtom);

  const handleChange = (event) => {
    setDataToShow({...dataToShow, [event.target.name]: event.target.checked});
  };

  return (
    <FormGroup column>
      {Object.keys(dataToShow).map((key) => (
        <FormControlLabel
          control={
            <Switch checked={dataToShow[key]} onChange={handleChange} name={key} color="primary" />
          }
          label={key}
        />
      ))}
    </FormGroup>
  );
}
