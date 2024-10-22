// Component with a list of checkboces to select which data to show

import {FormControlLabel, FormGroup, Switch} from '@mui/material';
import {useAtom} from 'jotai';
import React from 'react';

import useBreakpoints from '~/hooks/useBreakpoints';
import {dataToShowAtom} from '~/state/atoms';

export default function DataToShow() {
  const [dataToShow, setDataToShow] = useAtom(dataToShowAtom);
  const {isMobile} = useBreakpoints();
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setDataToShow({...dataToShow, [event.target.name]: event.target.checked});
  };

  return (
    <FormGroup row={isMobile} sx={{ml: 1}}>
      {Object.keys(dataToShow).map((key) => (
        <FormControlLabel
          key={key}
          control={
            <Switch
              checked={Object.entries(dataToShow).find((item) => item[0] === key)?.[1] === true}
              onChange={handleChange}
              name={key}
              color="primary"
            />
          }
          label={key}
        />
      ))}
    </FormGroup>
  );
}
